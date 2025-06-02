import { db } from "$lib/server/index";

interface Aluno {
  ID: number;
  Nome: string;
  Apelidos?: string;
  Curso: string;
  Periodo: string;
  HomePage?: string;
  NomeMiniaturaPes?: string;
}

interface LoadData {
  alunos: Aluno[];
}

type Ordem =
  | "ALFA"
  | "CURSOINGRESSO"
  | "CURSOSAIDA"
  | "INGRESSOCURSO"
  | "INGRESSONOME"
  | "SAIDACURSO"
  | "SAIDANOME";

async function pesquisarAlunos(busca: string, ordem: Ordem): Promise<Aluno[]> {
  let order_by: string;
  switch (ordem) {
    case "CURSOINGRESSO":
      order_by = "Curso, AnoInicio, lower(Nome)";
      break;
    case "CURSOSAIDA":
      order_by = "Curso, AnoTermino, lower(Nome)";
      break;
    case "INGRESSOCURSO":
      order_by = "AnoInicio, Curso, lower(Nome)";
      break;
    case "INGRESSONOME":
      order_by = "AnoInicio, lower(Nome)";
      break;
    case "SAIDACURSO":
      order_by = "AnoTermino, Curso, lower(Nome)";
      break;
    case "SAIDANOME":
      order_by = "AnoTermino, lower(Nome)";
      break;
    default:
      order_by = "lower(Nome)";
  }

  const escapedSearch = `%${busca.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
  console.log(escapedSearch);
  return new Promise((res, rej) => {
    db.all(
      "SELECT ID, Nome, Apelidos, Curso, AnoInicio, AnoTermino, HomePage, NomeMiniaturaPes FROM qryExAlunos WHERE Nome LIKE ? ESCAPE '\\' ORDER BY " +
        order_by +
        ";",
      [escapedSearch],
      (err, rows) => {
        if (err) {
          rej(err);
          return;
        }
        res(
          rows.map((r: any) => {
            if (r.AnoInicio && r.AnoTermino) {
              r.Periodo = r.AnoInicio + "-" + r.AnoTermino;
            } else {
              r.Periodo = "";
            }
            return r;
          }) as Aluno[],
        );
      },
    );
  });
}

async function lastAlunos(): Promise<Aluno[]> {
  let cmpTs = Date.now() - 1000 * 60 * 60 * 24 * 30;

  return new Promise((res, rej) => {
    db.all(
      "SELECT ID, Nome, Apelidos, Curso, AnoInicio, AnoTermino, HomePage, DtCadastro, NomeMiniaturaPes FROM qryExAlunos WHERE DtCadastro > ? ORDER BY DtCadastro DESC;",
      [cmpTs],
      (err, rows) => {
        if (err) {
          rej(err);
          return;
        }
        res(
          rows.map((r: any) => {
            if (r.AnoInicio && r.AnoTermino) {
              r.Periodo = r.AnoInicio + "-" + r.AnoTermino;
            } else {
              r.Periodo = "";
            }
            return r;
          }) as Aluno[],
        );
      },
    );
  });
}

export async function load({ url }): Promise<LoadData> {
  const order = url.searchParams.get("ORDEM") as Ordem | null;
  const Restricao = url.searchParams.get("Restricao");
  const busca = url.searchParams.get("busca");

  let alunos;
  if (Restricao === "LAST") {
    alunos = await lastAlunos();
  } else {
    alunos = await pesquisarAlunos(busca ?? "", order ?? "ALFA");
  }

  return {
    alunos: alunos,
  };
}
