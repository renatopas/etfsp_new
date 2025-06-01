import sharp, { type SharpInput } from "sharp";

interface ActionError {
  success: false;
  reason: string;
}

interface ActionSuccess {
  success: true;
  nome: string;
  id: number;
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

async function makeThumbnail(src: SharpInput): Promise<Buffer> {
  let img = sharp(src);
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

  let thumb = img.toFormat("webp").toBuffer();

  return thumb;
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

    try {
      await makeThumbnail(await file.arrayBuffer());
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
