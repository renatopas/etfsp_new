import { db } from "$lib";

interface Aluno {
  ID: number;
  Nome: string;
  Apelidos?: string;
  Curso: string;
  Periodo: string;
  HomePage?: string;
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
      order_by = "Curso, AnoInicio, Nome";
      break;
    case "CURSOSAIDA":
      order_by = "Curso, AnoTermino, Nome";
      break;
    case "INGRESSOCURSO":
      order_by = "AnoInicio, Curso, Nome";
      break;
    case "INGRESSONOME":
      order_by = "AnoInicio, Nome";
      break;
    case "SAIDACURSO":
      order_by = "AnoTermino, Curso, Nome";
      break;
    case "SAIDANOME":
      order_by = "AnoTermino, Nome";
      break;
    default:
      order_by = "Nome";
  }
  return new Promise((res, rej) => {
    db.all(
      "SELECT ID, Nome, Apelidos, Curso, AnoInicio, AnoTermino, HomePage FROM ExAlunos WHERE Excluido = 0 ORDER BY " +
        order_by +
        ";",
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
  let cmpTs = Date.now() - 1000 * 60 * 60 * 24 * 7;

  return new Promise((res, rej) => {
    db.all(
      "SELECT ID, Nome, Apelidos, Curso, AnoInicio, AnoTermino, HomePage, DtCadastro FROM ExAlunos WHERE Excluido = 0 AND DtCadastro > ? ORDER BY DtCadastro DESC;",
      [cmpTs],
      (err, rows) => {
        if (err) {
          rej(err);
          return;
        }
        console.log(rows.slice(0, 3));
        console.log(rows.slice(-3, rows.length));
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
