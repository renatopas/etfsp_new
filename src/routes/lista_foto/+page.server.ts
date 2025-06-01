import { db } from "$lib/server/index";

type Curso =
  | "Todos"
  | "PRD"
  | "TEL"
  | "ELO"
  | "ELE"
  | "EDI"
  | "MEC"
  | "INF"
  | undefined;

interface LoadData {
  titulo?: string;
  range_ano_foto_start?: number;
  range_ano_foto_end?: number;
  range_ano_formatura_start?: number;
  range_ano_formatura_end?: number;
  curso: Curso;
  isCarometro: boolean;
  fotos?: Foto[];
}

export interface Foto {
  TituloFoto?: string;
  CursoFoto: string;
  AnoFoto?: number;
  AnoFormatura?: number;
  NomeMiniaturaStored: string;
  NomeArqStored: string;
}

function intOrUndefined(val: string | null): number | undefined {
  return val ? parseInt(val) : undefined;
}

async function getFotos(
  curso: Curso,
  range_foto?: [number, number],
  range_formatura?: [number, number],
  carometro?: boolean,
): Promise<Foto[]> {
  let params: any[] = [];
  let sql_where = "WHERE Excluido = 0 ";
  sql_where += "AND Carometro = ? ";
  params.push(carometro ?? false);
  if (curso !== undefined) {
    sql_where += "AND CursoFoto = ?";
    params.push(curso);
  }
  return new Promise((res, rej) => {
    db.all(
      `SELECT TituloFoto, CursoFoto, AnoFoto, AnoFormatura, NomeMiniaturaStored, NomeArqStored FROM Fotos ${sql_where};`,
      params,
      (err, rows) => {
        if (err) {
          rej(err);
          return;
        }
        res(rows as Foto[]);
      },
    );
  });
}

async function getFotosByAluno(id: number): Promise<Foto[]> {
  return new Promise((res, rej) => {
    db.all(
      `SELECT TituloFoto, CursoFoto, AnoFoto, AnoFormatura, NomeMiniaturaStored, NomeArqStored FROM Fotos WHERE idExAlunoUpload = ?;`,
      [id],
      (err, rows) => {
        if (err) {
          rej(err);
          return;
        }
        res(rows as Foto[]);
      },
    );
  });
}

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const params = {
      titulo: formData.get("titulo") ?? undefined,
      range_ano_foto_start: intOrUndefined(
        formData.get("range_ano_foto_start")?.toString() ?? null,
      ),
      range_ano_foto_end: intOrUndefined(
        formData.get("range_ano_foto_end")?.toString() ?? null,
      ),
      range_ano_formatura_start: intOrUndefined(
        formData.get("range_ano_formatura_start")?.toString() ?? null,
      ),
      range_ano_formatura_end: intOrUndefined(
        formData.get("range_ano_formatura_end")?.toString() ?? null,
      ),
      curso: formData.get("curso") ?? undefined,
      isCarometro: formData.get("carometro") === "true",
    };

    if (params.curso == "") {
      params.curso = undefined as Curso;
    }

    const fotos = await getFotos(
      params.curso as Curso,
      undefined,
      undefined,
      params.isCarometro,
    );

    return {
      params: params,
      fotos: fotos,
    };
  },
};

export const load = async ({ url }) => {
  const id = Number(url.searchParams.get("idExAluno") ?? undefined);
  if (Number.isSafeInteger(id)) {
    return {
      fotos: await getFotosByAluno(id),
    };
  }
};
