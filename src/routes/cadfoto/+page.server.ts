import { fail, type Actions } from "@sveltejs/kit";
import { randomUUID } from "node:crypto";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { COURSES } from "$lib/domain";
import { db, FOTOS_DIR } from "$lib/server/index";
const MAX_SIZE = 5 * 1024 * 1024,
  MAX_PIXELS = 40_000_000,
  MIN_YEAR = 1909;
function positive(value: FormDataEntryValue | null) {
  const s = value?.toString() ?? "";
  return /^[1-9]\d*$/.test(s) && Number.isSafeInteger(Number(s))
    ? Number(s)
    : undefined;
}
function bool(value: FormDataEntryValue | null) {
  return value?.toString() === "true";
}
function validYear(value: FormDataEntryValue | null) {
  const s = value?.toString() ?? "";
  const n = /^\d{4}$/.test(s) ? Number(s) : undefined;
  return n && n >= MIN_YEAR && n <= new Date().getFullYear() ? n : undefined;
}
function get<T>(sql: string, params: unknown[]): Promise<T | undefined> {
  return new Promise((resolve, reject) =>
    db.get(sql, params, (e, row: T | undefined) =>
      e ? reject(e) : resolve(row),
    ),
  );
}
function run(sql: string, params: unknown[]): Promise<void> {
  return new Promise((resolve, reject) =>
    db.run(sql, params, (e) => (e ? reject(e) : resolve())),
  );
}
export const actions: Actions = {
  default: async ({ request }) => {
    const fd = await request.formData();
    const id = positive(fd.get("IdExAlunoUp"));
    const file = fd.get("arquivo");
    const title = (fd.get("TituloFoto")?.toString() ?? "").trim();
    const course = (fd.get("CursoFoto")?.toString() ?? "").trim();
    const className = (fd.get("TurmaFoto")?.toString() ?? "").trim();
    const photoYear = validYear(fd.get("AnoFoto"));
    const graduationYear = validYear(fd.get("AnoFormatura"));
    if (
      !id ||
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > MAX_SIZE ||
      !title ||
      title.length < 4 ||
      title.length > 250 ||
      !(COURSES as readonly string[]).includes(course) ||
      className.length < 1 ||
      className.length > 15
    )
      return fail(400, {
        success: false,
        reason: "Revise os campos obrigatórios e o arquivo selecionado.",
      });
    const alumnus = await get<{ Nome: string }>(
      "SELECT Nome FROM ExAlunos WHERE ID=? AND Excluido=0",
      [id],
    );
    if (!alumnus)
      return fail(400, {
        success: false,
        reason: "Selecione um ex-aluno válido.",
      });
    let original: Buffer,
      thumb: Buffer,
      width = 0,
      height = 0;
    try {
      const image = sharp(await file.arrayBuffer(), {
        limitInputPixels: MAX_PIXELS,
      });
      const metadata = await image.metadata();
      width = metadata.width ?? 0;
      height = metadata.height ?? 0;
      if (!width || !height) throw new Error();
      original = await image.clone().webp().toBuffer();
      thumb = await image
        .clone()
        .resize(320, 240, { fit: "inside", withoutEnlargement: true })
        .webp()
        .toBuffer();
    } catch {
      return fail(400, {
        success: false,
        reason:
          "Não foi possível processar esta imagem. Escolha uma imagem válida de até 5 MB.",
      });
    }
    const key = randomUUID();
    const stored = `${key}.webp`,
      mini = `${key}-mini.webp`;
    const files = [path.join(FOTOS_DIR, stored), path.join(FOTOS_DIR, mini)];
    try {
      await Promise.all([
        writeFile(files[0], original),
        writeFile(files[1], thumb),
      ]);
      await run(
        "INSERT INTO Fotos (NomeArqOriginal,NomeArqStored,NomeMiniaturaStored,DtUploadFoto,TituloFoto,CursoFoto,AnoFoto,Carometro,TurmaFoto,FotoPessoal,idExAlunoUpload,TamanhoFoto,ContentType,OrigLargura,OrigAltura) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          file.name.slice(0, 255),
          stored,
          mini,
          Date.now(),
          title,
          course,
          photoYear ?? null,
          bool(fd.get("Carometro")) ? 1 : 0,
          className,
          bool(fd.get("FotoPessoal")) ? 1 : 0,
          id,
          file.size,
          "image/webp",
          width,
          height,
        ],
      );
    } catch {
      await Promise.all(files.map((name) => rm(name, { force: true })));
      return fail(500, {
        success: false,
        reason:
          "Não foi possível concluir o envio agora. Tente novamente mais tarde.",
      });
    }
    return { success: true, nome: alumnus.Nome, id };
  },
};
