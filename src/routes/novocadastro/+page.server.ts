import { fail, type Actions } from "@sveltejs/kit";
import { COURSES, type Course } from "$lib/domain";
import { db } from "$lib/server/index";
import {
  normalizeSocialNetworkUrl,
  SOCIAL_NETWORKS,
  type SocialNetworkField,
} from "$lib/server/social-networks";
import { validateRequest } from "$lib/server/turnstile";

const MIN_YEAR = 1909;
const FOUND_BY = [
  "Google",
  "Indicação de amigos",
  "Link em outras páginas",
  "Facebook",
  "Bing",
  "Outros",
] as const;
type FieldName =
  | "Nome"
  | "Apelidos"
  | "Curso"
  | "AnoInicio"
  | "AnoTermino"
  | "Email"
  | "Telefone"
  | "HomePage"
  | SocialNetworkField
  | "Endereco"
  | "Cidade"
  | "Estado"
  | "CEP"
  | "Pais"
  | "ComoEncontrou"
  | "ComoEncontrouExtra"
  | "DadoPubl";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName | "form", string>>;

function text(formData: FormData, name: FieldName): string {
  return (formData.get(name)?.toString() ?? "").trim();
}

function isCourse(value: string): value is Course {
  return (COURSES as readonly string[]).includes(value);
}
function year(value: string): number | undefined {
  return /^\d{4}$/.test(value) ? Number(value) : undefined;
}
function optional(value: string): string | null {
  return value || null;
}
function homepage(value: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(
      /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`,
    );
    return ["http:", "https:"].includes(url.protocol)
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}
function run(sql: string, params: unknown[]): Promise<void> {
  return new Promise((resolve, reject) =>
    db.run(sql, params, (queryError) =>
      queryError ? reject(queryError) : resolve(),
    ),
  );
}

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const values = Object.fromEntries(
      (
        [
          "Nome",
          "Apelidos",
          "Curso",
          "AnoInicio",
          "AnoTermino",
          "Email",
          "Telefone",
          "HomePage",
          "Instagram",
          "Facebook",
          "LinkedIn",
          "Endereco",
          "Cidade",
          "Estado",
          "CEP",
          "Pais",
          "ComoEncontrou",
          "ComoEncontrouExtra",
          "DadoPubl",
        ] as FieldName[]
      ).map((name) => [name, text(formData, name)]),
    ) as Values;
    const errors: Errors = {};
    const currentYear = new Date().getFullYear();
    const startYear = year(values.AnoInicio);
    const endYear = year(values.AnoTermino);
    const normalizedHomepage = homepage(values.HomePage);
    const normalizedSocialNetworks = Object.fromEntries(
      (Object.keys(SOCIAL_NETWORKS) as SocialNetworkField[]).map((field) => [
        field,
        values[field]
          ? normalizeSocialNetworkUrl(values[field], field)
          : undefined,
      ]),
    ) as Record<SocialNetworkField, string | undefined>;

    if (values.Nome.length < 5 || values.Nome.length > 120)
      errors.Nome = "Informe o nome completo, com 5 a 120 caracteres.";
    if (values.Apelidos.length > 80)
      errors.Apelidos = "O apelido deve ter no máximo 80 caracteres.";
    if (!isCourse(values.Curso)) errors.Curso = "Selecione um curso válido.";
    if (!startYear || startYear < MIN_YEAR || startYear > currentYear)
      errors.AnoInicio = "Informe um ano entre 1909 e o ano atual.";
    if (
      !endYear ||
      endYear < MIN_YEAR ||
      endYear > currentYear ||
      (startYear && endYear < startYear)
    )
      errors.AnoTermino =
        "Informe um ano válido, igual ou posterior ao ingresso.";
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.Email) ||
      /[,;]/.test(values.Email)
    )
      errors.Email = "Informe um único endereço de e-mail válido.";
    if (values.Telefone.length > 30)
      errors.Telefone = "O telefone deve ter no máximo 30 caracteres.";
    if (values.HomePage && !normalizedHomepage)
      errors.HomePage = "Informe uma página com endereço http ou https válido.";
    for (const field of Object.keys(SOCIAL_NETWORKS) as SocialNetworkField[]) {
      if (values[field] && !normalizedSocialNetworks[field]) {
        errors[field] =
          `Informe uma URL HTTPS válida de ${SOCIAL_NETWORKS[field].label}, ` +
          `com no máximo 500 caracteres.`;
      }
    }
    if (values.Endereco.length > 200)
      errors.Endereco = "O endereço deve ter no máximo 200 caracteres.";
    if (values.Cidade.length > 100)
      errors.Cidade = "A cidade deve ter no máximo 100 caracteres.";
    if (values.Estado.length > 50)
      errors.Estado = "O estado deve ter no máximo 50 caracteres.";
    if (values.CEP.length > 20)
      errors.CEP = "O CEP deve ter no máximo 20 caracteres.";
    if (values.Pais.length > 80)
      errors.Pais = "O país deve ter no máximo 80 caracteres.";
    if (
      values.ComoEncontrou &&
      !(FOUND_BY as readonly string[]).includes(values.ComoEncontrou)
    )
      errors.ComoEncontrou = "Selecione uma opção válida.";
    if (values.ComoEncontrouExtra.length > 160)
      errors.ComoEncontrouExtra =
        "O detalhe deve ter no máximo 160 caracteres.";
    if (values.DadoPubl.length > 2000)
      errors.DadoPubl =
        "As informações para o perfil devem ter no máximo 2.000 caracteres.";
    if (Object.keys(errors).length)
      return fail(400, { success: false, errors, values });

    let turnstileValid = false;
    try {
      turnstileValid = await validateRequest(formData, request.headers);
    } catch {
      turnstileValid = false;
    }
    if (!turnstileValid)
      return fail(400, {
        success: false,
        errors: {
          form: "Não foi possível validar o desafio antiabuso. Tente novamente.",
        },
        values,
      });

    try {
      await run(
        `INSERT INTO ExAlunos (Nome, Apelidos, Curso, AnoInicio, AnoTermino, Email, HomePage, Instagram, Facebook, LinkedIn, Endereco, Cidade, Estado, CEP, Pais, Telefone, DadoPubl, ComoEncontrou, ComoEncontrouExtra, DtCadastro)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          values.Nome,
          optional(values.Apelidos),
          values.Curso,
          startYear,
          endYear,
          values.Email,
          optional(normalizedHomepage ?? ""),
          optional(normalizedSocialNetworks.Instagram ?? ""),
          optional(normalizedSocialNetworks.Facebook ?? ""),
          optional(normalizedSocialNetworks.LinkedIn ?? ""),
          optional(values.Endereco),
          optional(values.Cidade),
          optional(values.Estado),
          optional(values.CEP),
          optional(values.Pais) ?? "Brasil",
          optional(values.Telefone),
          optional(values.DadoPubl),
          optional(values.ComoEncontrou),
          optional(values.ComoEncontrouExtra),
          Date.now(),
        ],
      );
    } catch {
      return fail(500, {
        success: false,
        errors: {
          form: "Não foi possível concluir o cadastro agora. Tente novamente mais tarde.",
        },
        values,
      });
    }
    return { success: true, data: { course: values.Curso, startYear } };
  },
};
