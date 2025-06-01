import { db } from "$lib";
import { error } from "@sveltejs/kit";

interface DadosAluno {
  Nome: string;
  ID: number;
  Apelidos: string;
  TipoCurso: string;
  Curso: string;
  AnoInicio: number;
  AnoTermino: number;
  Email: string;
  HomePage: string;
  ICQ: string;
  DtCadastro: number;
  Comentarios: string;
  ComoEncontrou: string;
  ComoEncontrouExtra: string;
  DadoPubl: string;
  NomeMiniaturaPes: string;
  QtdFotos: number;
}

async function getDadosAluno(
  id: number,
): Promise<Partial<DadosAluno> | undefined> {
  return new Promise((res, rej) => {
    db.get(
      "SELECT \
        ID, \
        Nome, \
        Apelidos, \
        Curso, \
        AnoInicio, \
        AnoTermino, \
        Email, \
        HomePage, \
        ICQ, \
        DtCadastro, \
        Comentarios, \
        ComoEncontrou, \
        ComoEncontrouExtra, \
        DadoPubl, \
        NomeMiniaturaPes, \
        QtdFotos \
      FROM qryExAlunos \
      WHERE ID = ?",
      id,
      (err, row?: Partial<DadosAluno>) => {
        if (err) {
          rej(err);
          return;
        }
        res(row);
      },
    );
  });
}

export const load = async ({ url }) => {
  const idParam = url.searchParams.get("id");
  if (idParam === null || Number.isNaN(parseInt(idParam))) {
    error(401);
  }
  const dados = await getDadosAluno(parseInt(idParam));
  if (!dados) {
    error(404);
  }
  return dados;
};
