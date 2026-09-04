import { error } from "@sveltejs/kit";
import type { PublicAlumniProfile } from "$lib/domain";
import { db } from "$lib/server/index";
import { normalizeSocialNetworkUrl } from "$lib/server/social-networks";
import { normalizeWhatsApp, whatsappUrl } from "$lib/server/whatsapp";

interface ProfileRow {
  ID: number;
  Nome: string;
  Apelidos: string | null;
  Curso: string | null;
  AnoInicio: number | null;
  AnoTermino: number | null;
  Email: string | null;
  Telefone: string | null;
  WhatsApp: string | null;
  HomePage: string | null;
  Instagram: string | null;
  Facebook: string | null;
  LinkedIn: string | null;
  ICQ: string | null;
  DadoPubl: string | null;
  Comentarios: string | null;
  DtCadastro: number | null;
  NomeMiniaturaStored: string | null;
  QtdFotos: number;
}

function get<T>(sql: string, params: unknown[]): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (queryError, row: T | undefined) => {
      if (queryError) {
        reject(queryError);
        return;
      }

      resolve(row);
    });
  });
}

export function parseAlumniId(value: string | null): number {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    error(400, "Identificador de ex-aluno inválido.");
  }

  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    error(400, "Identificador de ex-aluno inválido.");
  }

  return id;
}

function toOptionalText(value: string | null): string | undefined {
  const text = value?.trim();
  return text || undefined;
}

function toOptionalYear(value: number | null): number | undefined {
  return value !== null && Number.isInteger(value) ? value : undefined;
}

function toOptionalTimestamp(value: number | null): number | undefined {
  return value !== null && Number.isSafeInteger(value) && value > 0
    ? value
    : undefined;
}

function normalizeHomepage(value: string | null): string | undefined {
  const homepage = value?.trim();
  if (!homepage) {
    return undefined;
  }

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(homepage)
    ? homepage
    : `https://${homepage}`;

  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function mapProfile(row: ProfileRow): PublicAlumniProfile {
  return {
    id: row.ID,
    name: row.Nome,
    nickname: toOptionalText(row.Apelidos),
    course: toOptionalText(row.Curso),
    startYear: toOptionalYear(row.AnoInicio),
    endYear: toOptionalYear(row.AnoTermino),
    thumbnail: toOptionalText(row.NomeMiniaturaStored),
    email: toOptionalText(row.Email),
    phone: toOptionalText(row.Telefone),
    whatsapp: row.WhatsApp ? normalizeWhatsApp(row.WhatsApp) : undefined,
    whatsappUrl: row.WhatsApp ? whatsappUrl(row.WhatsApp) : undefined,
    homepage: normalizeHomepage(row.HomePage),
    instagram: row.Instagram
      ? normalizeSocialNetworkUrl(row.Instagram, "Instagram")
      : undefined,
    facebook: row.Facebook
      ? normalizeSocialNetworkUrl(row.Facebook, "Facebook")
      : undefined,
    linkedin: row.LinkedIn
      ? normalizeSocialNetworkUrl(row.LinkedIn, "LinkedIn")
      : undefined,
    icq: toOptionalText(row.ICQ),
    publicInfo: toOptionalText(row.DadoPubl),
    comments: toOptionalText(row.Comentarios),
    registeredAt: toOptionalTimestamp(row.DtCadastro),
    photoCount: row.QtdFotos,
  };
}

export async function loadPublicAlumniProfile(
  id: number,
): Promise<PublicAlumniProfile> {
  const row = await get<ProfileRow>(
    `SELECT
      e.ID,
      e.Nome,
      e.Apelidos,
      e.Curso,
      e.AnoInicio,
      e.AnoTermino,
      CASE WHEN e.OcultarEmail = 0 THEN e.Email END AS Email,
      CASE WHEN e.PublicaTelefone = 1 THEN e.Telefone END AS Telefone,
      e.WhatsApp,
      e.HomePage,
      e.Instagram,
      e.Facebook,
      e.LinkedIn,
      e.ICQ,
      e.DadoPubl,
      e.Comentarios,
      e.DtCadastro,
      (
        SELECT f.NomeMiniaturaStored
        FROM Fotos AS f
        WHERE f.idExAlunoUpload = e.ID
          AND f.Excluido = 0
          AND f.FotoPessoal = 1
        ORDER BY f.idFoto DESC
        LIMIT 1
      ) AS NomeMiniaturaStored,
      (
        SELECT COUNT(*)
        FROM Fotos AS f
        WHERE f.idExAlunoUpload = e.ID
          AND f.Excluido = 0
      ) AS QtdFotos
    FROM ExAlunos AS e
    WHERE e.ID = ?
      AND e.Excluido = 0`,
    [id],
  );

  if (!row) {
    error(404, "Ex-aluno não encontrado.");
  }

  return mapProfile(row);
}
