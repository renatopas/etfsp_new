import { db } from "$lib/db.js";

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

async function pesquisar_alunos(busca: string, ordem: Ordem): Promise<Aluno[]> {
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

export async function load({ url }): Promise<LoadData> {
  const order = url.searchParams.get("ORDEM") as Ordem | null;
  const busca = url.searchParams.get("busca");

  return {
    alunos: await pesquisar_alunos(busca ?? "", order ?? "ALFA"),
  };
}
