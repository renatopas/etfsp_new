import { db, FOTOS_DIR } from "$lib/server/index.js";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type Sharp } from "sharp";

interface ActionError {
  success: false;
  reason: string;
}

interface ActionSuccess {
  success: true;
  nome: string;
  id: number;
}

interface PhotoData {
  NomeArqOriginal: string;
  CursoFoto: string;
  AnoFoto?: number;
  TituloFoto: string;
  AnoFormatura?: number;
  Carometro: boolean;
  TurmaFoto: string;
  FotoPessoal: boolean;
  idExAlunoUpload: number;
  TamanhoFoto: number;
  ContentType: string;
  OrigLargura: number;
  OrigAltura: number;
}

function fdToBool(value: FormDataEntryValue | null): boolean {
  let str = value?.toString();
  return str === "true";
}

function fdToInt(value: FormDataEntryValue | null): number | undefined {
  let str = value?.toString();
  if (!str) {
    return;
  }
  let int = parseInt(str);
  return Number.isSafeInteger(int) ? int : undefined;
}

const THUMB_MAX_SIDE = 100;

async function makeThumbnail(img: Sharp): Promise<Buffer> {
  let { width, height } = await img.metadata();
  let twidth: number, theight: number;

  if (width > height) {
    twidth = THUMB_MAX_SIDE;
    theight = Math.round((height / width) * THUMB_MAX_SIDE);
  } else {
    theight = THUMB_MAX_SIDE;
    twidth = Math.round((width / height) * THUMB_MAX_SIDE);
  }

  img.resize(twidth, theight);

  return img.toFormat("webp").toBuffer();
}

async function savePhoto(
  orig: Buffer<ArrayBufferLike>,
  thumb: Buffer<ArrayBufferLike>,
  data: PhotoData,
) {
  new Promise((res, rej) => {
    db.get(
      "INSERT INTO Fotos (\
        NomeArqOriginal,\
        NomeArqStored,\
        NomeMiniaturaStored,\
        DtUploadFoto,\
        TituloFoto,\
        CursoFoto,\
        AnoFoto,\
        Carometro,\
        TurmaFoto,\
        FotoPessoal,\
        idExAlunoUpload,\
        TamanhoFoto,\
        ContentType,\
        OrigLargura,\
        OrigAltura\
      ) SELECT \
        ?1,\
        (cast(max(idFoto) + 1 AS TEXT) || '_' || ?1),\
        (cast(max(idFoto) + 1 AS TEXT) || '_Mini_' || ?1),\
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? FROM Fotos\
        RETURNING NomeArqStored, NomeMiniaturaStored",
      [
        data.NomeArqOriginal,
        Date.now(),
        data.TituloFoto.trim(),
        data.CursoFoto.trim(),
        data.AnoFoto ?? null,
        data.Carometro ?? false,
        data.TurmaFoto.trim(),
        data.FotoPessoal ?? false,
        data.idExAlunoUpload,
        data.TamanhoFoto,
        data.ContentType,
        data.OrigLargura,
        data.OrigAltura,
      ],
      (
        err,
        row: { NomeArqStored: string; NomeMiniaturaStored: string } | undefined,
      ) => {
        if (err) {
          rej(err);
          return;
        }
        if (!row) {
          console.error("Failed to get file names");
          rej();
          return;
        }
        Promise.all([
          writeFile(path.join(FOTOS_DIR, data.NomeArqOriginal), orig),
          writeFile(path.join(FOTOS_DIR, row.NomeArqStored), orig),
          writeFile(path.join(FOTOS_DIR, row.NomeMiniaturaStored), thumb),
        ]).then(
          (r) => res(r),
          (e) => rej(e),
        );
      },
    );
  });
}

export const actions = {
  default: async ({ request }): Promise<ActionError | ActionSuccess> => {
    const formData = await request.formData();

    let file = formData.get("arquivo") as File;

    if (!(file instanceof File)) {
      return {
        success: false,
        reason: "arquivo deve ser um arquivo (como vc conseguiu fazer isso?)",
      };
    }

    if (!file.type.match(/^image\/(png|gif|jpeg|webp|avif)$/i)) {
      return {
        success: false,
        reason: "arquivo deve ser uma imagem (png, gif, jpg, webp ou avif)",
      };
    }

    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        reason: "a imagem enviada é grande demais (limite 5MB)",
      };
    }

    const titulo = formData.get("TituloFoto")?.toString();
    if (!titulo || titulo.length < 4 || titulo.length > 250) {
      return {
        success: false,
        reason: "titulo inválido",
      };
    }

    const curso = formData.get("CursoFoto")?.toString();
    if (!curso) {
      // TODO: validar cursos
      return {
        success: false,
        reason: "curso inválido",
      };
    }

    const nome = formData.get("NomeExAlunoUpload")?.toString();
    if (!nome) {
      return {
        success: false,
        reason: "Nome inválido",
      };
    }

    const turma = formData.get("TurmaFoto")?.toString();
    if (!turma) {
      return {
        success: false,
        reason: "Turma inválida",
      };
    }

    const id = fdToInt(formData.get("IdExAlunoUp"));
    if (id === undefined) {
      return {
        success: false,
        reason: "ID enviado inválido",
      };
    }

    const isCarometro = fdToBool(formData.get("Carometro"));
    const isPessoal = fdToBool(formData.get("FotoPessoal"));

    const anoFoto = fdToInt(formData.get("AnoFoto"));
    const anoFormatura = fdToInt(formData.get("AnoFormatura"));

    console.log(formData);

    try {
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9._\-]/g, "_")
        .replace(/\.\w+$/, ".webp");

      const src = sharp(await file.arrayBuffer());
      let { width, height } = await src.metadata();
      const [thumb, orig] = await Promise.all([
        makeThumbnail(src.clone()),
        src.toFormat("webp").toBuffer(),
      ]);
      savePhoto(orig, thumb, {
        NomeArqOriginal: sanitizedName,
        CursoFoto: curso,
        AnoFoto: anoFoto,
        TituloFoto: titulo,
        AnoFormatura: anoFormatura,
        Carometro: isCarometro,
        TurmaFoto: turma,
        FotoPessoal: isPessoal,
        idExAlunoUpload: id,
        TamanhoFoto: file.size,
        ContentType: file.type,
        OrigLargura: width,
        OrigAltura: height,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        return {
          success: false,
          reason: `um erro ocorreu ao processar sua imagem: ${e.toString()}`,
        };
      } else {
        return {
          success: false,
          reason: "um erro ocorreu ao processar sua imagem",
        };
      }
    }

    return {
      success: true,
      nome: nome,
      id: id,
    };
  },
};
