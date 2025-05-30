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
    if (!data.Curso) {
      return { success: false, reason: "Falta parametro curso" };
    }
    if (!data.AnoTermino) {
      return { success: false, reason: "Falta parametro AnoTermino" };
    }
    if (!data.AnoInicio) {
      return { success: false, reason: "Falta parametro AnoInicio" };
    }
    return {
      success: true,
      data: { Curso: data.Curso, AnoInicio: Number(data.AnoInicio) },
    };
  },
};
