import { fail, type Actions } from "@sveltejs/kit";
import { randomUUID } from "node:crypto";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { isCourse } from "$lib/domain";
import { db, FOTOS_DIR } from "$lib/server/index";
const MAX_SIZE = 5 * 1024 * 1024,
  MAX_PIXELS = 40_000_000,
  MIN_YEAR = 1909;

const FORM_FIELDS = [
  "IdExAlunoUp",
  "TituloFoto",
  "CursoFoto",
  "TurmaFoto",
  "AnoFoto",
  "AnoFormatura",
  "Carometro",
  "FotoPessoal",
] as const;
type FormField = (typeof FORM_FIELDS)[number];
type FormValues = Record<FormField, string>;
type FormErrors = Partial<Record<"AnoFoto" | "AnoFormatura", string>>;

function text(formData: FormData, name: FormField): string {
  return (formData.get(name)?.toString() ?? "").trim();
}

function positive(value: FormDataEntryValue | null) {
  const s = value?.toString() ?? "";
  return /^[1-9]\d*$/.test(s) && Number.isSafeInteger(Number(s))
    ? Number(s)
    : undefined;
}
function validYear(value: string): number | null | undefined {
  if (!value) return null;

  const year = /^\d{4}$/.test(value) ? Number(value) : undefined;
  return year && year >= MIN_YEAR && year <= new Date().getFullYear()
    ? year
    : undefined;
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
    const values = Object.fromEntries(
      FORM_FIELDS.map((name) => [name, text(fd, name)]),
    ) as FormValues;
    const errors: FormErrors = {};
    const id = positive(values.IdExAlunoUp);
    const file = fd.get("arquivo");
    const title = values.TituloFoto;
    const course = values.CursoFoto;
    const className = values.TurmaFoto;
    const photoYear = validYear(values.AnoFoto);
    const graduationYear = validYear(values.AnoFormatura);

    if (photoYear === undefined)
      errors.AnoFoto = "Informe um ano entre 1909 e o ano atual.";
    if (graduationYear === undefined)
      errors.AnoFormatura = "Informe um ano entre 1909 e o ano atual.";
    if (Object.keys(errors).length)
      return fail(400, { success: false, errors, values });

    if (
      !id ||
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > MAX_SIZE ||
      !title ||
      title.length < 4 ||
      title.length > 250 ||
      !isCourse(course) ||
      className.length < 1 ||
      className.length > 15
    )
      return fail(400, {
        success: false,
        reason: "Revise os campos obrigatórios e o arquivo selecionado.",
        values,
      });
    const alumnus = await get<{ Nome: string }>(
      "SELECT Nome FROM ExAlunos WHERE ID=? AND Excluido=0",
      [id],
    );
    if (!alumnus)
      return fail(400, {
        success: false,
        reason: "Selecione um ex-aluno válido.",
        values,
      });
    let original: Buffer,
      thumb: Buffer,
      width = 0,
      height = 0;
    try {
      const input = await file.arrayBuffer();
      const originalResult = await sharp(input, {
        limitInputPixels: MAX_PIXELS,
      })
        .autoOrient()
        .webp()
        .toBuffer({ resolveWithObject: true });
      original = originalResult.data;
      width = originalResult.info.width;
      height = originalResult.info.height;
      if (!width || !height) throw new Error();
      thumb = await sharp(input, { limitInputPixels: MAX_PIXELS })
        .autoOrient()
        .resize(320, 240, { fit: "inside", withoutEnlargement: true })
        .webp()
        .toBuffer();
    } catch {
      return fail(400, {
        success: false,
        reason:
          "Não foi possível processar esta imagem. Escolha uma imagem válida de até 5 MB.",
        values,
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
        "INSERT INTO Fotos (NomeArqOriginal,NomeArqStored,NomeMiniaturaStored,DtUploadFoto,TituloFoto,CursoFoto,AnoFoto,AnoFormatura,Carometro,TurmaFoto,FotoPessoal,idExAlunoUpload,TamanhoFoto,ContentType,OrigLargura,OrigAltura) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          file.name.slice(0, 255),
          stored,
          mini,
          Date.now(),
          title,
          course,
          photoYear,
          graduationYear,
          values.Carometro === "true" ? 1 : 0,
          className,
          values.FotoPessoal === "true" ? 1 : 0,
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
        values,
      });
    }
    return { success: true, nome: alumnus.Nome, id };
  },
};
