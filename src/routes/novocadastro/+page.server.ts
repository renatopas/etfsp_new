import { db } from "$lib";

interface FormData {
  Operacao: string;
  Nome: string;
  Apelidos: string;
  Curso: string;
  TipoCurso: string;
  AnoInicio: string;
  AnoTermino: string;
  Email: string;
  ICQ: string;
  HomePage: string;
  Endereco: string;
  Cidade: string;
  Estado: string;
  CEP: string;
  Pais: string;
  Telefone: string;
  publica_telefone: string;
  DadoPubl: string;
  ComoEncontrou: string;
  ComoEncontrouExtra: string;
  Comentarios: string;
}

interface FormSuccess {
  success: true;
  data: {
    Curso: string;
    AnoInicio: number;
  };
}

interface FormError {
  success: false;
  reason: string;
}
async function cadastrarAluno(dados: Partial<FormData>): Promise<boolean> {
  if (!dados.Nome || !dados.Email || !dados.Curso) {
    return false;
  }

  const today = new Date();

  return new Promise((res, rej) => {
    db.run(
      "INSERT INTO ExAlunos (\
        Nome,\
        Apelidos,\
        Curso,\
        AnoInicio,\
        AnoTermino,\
        Email,\
        ICQ,\
        HomePage,\
        Endereco,\
        Cidade,\
        Estado,\
        CEP,\
        Pais,\
        Telefone,\
        DadoPubl,\
        ComoEncontrou,\
        ComoEncontrouExtra,\
        Comentarios,\
        DtCadastro\
      ) VALUES (\
        $Nome,\
        $Apelidos,\
        $Curso,\
        $AnoInicio,\
        $AnoTermino,\
        $Email,\
        $ICQ,\
        $HomePage,\
        $Endereco,\
        $Cidade,\
        $Estado,\
        $CEP,\
        $Pais,\
        $Telefone,\
        $DadoPubl,\
        $ComoEncontrou,\
        $ComoEncontrouExtra,\
        $Comentarios,\
        $DtCadastro\
      );",
      [
        dados.Nome ?? null,
        dados.Apelidos ?? null,
        dados.Curso ?? null,
        dados.AnoInicio ?? null,
        dados.AnoTermino ?? null,
        dados.Email ?? null,
        dados.ICQ ?? null,
        dados.HomePage ?? null,
        dados.Endereco ?? null,
        dados.Cidade ?? null,
        dados.Estado ?? null,
        dados.CEP ?? null,
        dados.Pais ?? null,
        dados.Telefone ?? null,
        dados.DadoPubl ?? null,
        dados.ComoEncontrou ?? null,
        dados.ComoEncontrouExtra ?? null,
        dados.Comentarios ?? null,
        Date.now(),
      ],
      (err) => {
        res(err == null);
        if (err) {
          console.error(err, err.cause, err.stack, dados);
          rej(err);
          return;
        } else {
          console.debug("usuario adicionado", dados);
        }
      },
    );
  });
}

export const actions = {
  default: async ({ request }): Promise<FormSuccess | FormError> => {
    const formData = await request.formData();
    const params = [
      "Operacao",
      "Nome",
      "Apelidos",
      "Curso",
      "TipoCurso",
      "AnoInicio",
      "AnoTermino",
      "Email",
      "ICQ",
      "HomePage",
      "Endereco",
      "Cidade",
      "Estado",
      "CEP",
      "Pais",
      "Telefone",
      "publica_telefone",
      "DadoPubl",
      "ComoEncontrou",
      "ComoEncontrouExtra",
      "Comentarios",
    ];

    let data: Partial<FormData> = {};
    for (const param of params) {
      const p = formData.get(param)?.toString();
      if (p) {
        data[param as keyof FormData] = p.trim();
      }
    }
    for (const param of ["Curso", "Nome", "Email", "AnoTermino", "AnoInicio"]) {
      if (!data[param as keyof FormData]) {
        return { success: false, reason: "Falta parametro curso" };
      }
    }
    await cadastrarAluno(data);
    return {
      success: true,
      data: { Curso: data.Curso as string, AnoInicio: Number(data.AnoInicio) },
    };
  },
};
