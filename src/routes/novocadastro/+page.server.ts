import { fail, type Actions } from "@sveltejs/kit";
import { isCourse } from "$lib/domain";
import { db } from "$lib/server/index";
import {
  normalizeSocialNetworkUrl,
  SOCIAL_NETWORKS,
  type SocialNetworkField,
} from "$lib/server/social-networks";
import { validateRequest } from "$lib/server/turnstile";
import { normalizeWhatsApp } from "$lib/server/whatsapp";

const MIN_YEAR = 1909;
type FieldName =
  | "Nome"
  | "Apelidos"
  | "Curso"
  | "AnoInicio"
  | "AnoTermino"
  | "Email"
  | "WhatsApp"
  | "HomePage"
  | SocialNetworkField
  | "DadoPubl";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName | "Contato" | "form", string>>;

const FIELD_NAMES: FieldName[] = [
  "Nome",
  "Apelidos",
  "Curso",
  "AnoInicio",
  "AnoTermino",
  "Email",
  "WhatsApp",
  "Instagram",
  "Facebook",
  "LinkedIn",
  "HomePage",
  "DadoPubl",
];

function text(formData: FormData, name: FieldName): string {
  return (formData.get(name)?.toString() ?? "").trim();
}

function year(value: string): number | undefined {
  return /^\d{4}$/.test(value) ? Number(value) : undefined;
}

function optional(value: string | undefined): string | null {
  return value || null;
}

function email(value: string): string | undefined {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[,;]/.test(value)
    ? value
    : undefined;
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
      FIELD_NAMES.map((name) => [name, text(formData, name)]),
    ) as Values;
    const errors: Errors = {};
    const currentYear = new Date().getFullYear();
    const startYear = year(values.AnoInicio);
    const endYear = year(values.AnoTermino);
    const normalizedEmail = values.Email ? email(values.Email) : undefined;
    const normalizedWhatsApp = values.WhatsApp
      ? normalizeWhatsApp(values.WhatsApp)
      : undefined;
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
    if (values.Email && !normalizedEmail)
      errors.Email = "Informe um único endereço de e-mail válido.";
    if (values.WhatsApp && !normalizedWhatsApp)
      errors.WhatsApp =
        "Informe o WhatsApp com código do país, como +55 11 99999-9999.";
    if (values.HomePage && !normalizedHomepage)
      errors.HomePage = "Informe uma página com endereço http ou https válido.";
    for (const field of Object.keys(SOCIAL_NETWORKS) as SocialNetworkField[]) {
      if (values[field] && !normalizedSocialNetworks[field]) {
        errors[field] =
          `Informe uma URL HTTPS válida de ${SOCIAL_NETWORKS[field].label}, ` +
          `com no máximo 500 caracteres.`;
      }
    }
    if (values.DadoPubl.length > 2000)
      errors.DadoPubl =
        "O texto para o perfil deve ter no máximo 2.000 caracteres.";

    const hasValidContact = Boolean(
      normalizedEmail ||
      normalizedWhatsApp ||
      normalizedHomepage ||
      normalizedSocialNetworks.Instagram ||
      normalizedSocialNetworks.Facebook ||
      normalizedSocialNetworks.LinkedIn,
    );
    const hasContactError = Boolean(
      errors.Email ||
      errors.WhatsApp ||
      errors.HomePage ||
      errors.Instagram ||
      errors.Facebook ||
      errors.LinkedIn,
    );
    if (!hasValidContact && !hasContactError)
      errors.Contato = "Informe pelo menos uma forma de contato.";

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
        `INSERT INTO ExAlunos (
          Nome, Apelidos, Curso, AnoInicio, AnoTermino, Email, WhatsApp,
          Instagram, Facebook, LinkedIn, HomePage, DadoPubl, DtCadastro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          values.Nome,
          optional(values.Apelidos),
          values.Curso,
          startYear,
          endYear,
          optional(normalizedEmail),
          optional(normalizedWhatsApp),
          optional(normalizedSocialNetworks.Instagram),
          optional(normalizedSocialNetworks.Facebook),
          optional(normalizedSocialNetworks.LinkedIn),
          optional(normalizedHomepage),
          optional(values.DadoPubl),
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
