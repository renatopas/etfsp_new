import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import {
  ALUMNI_ORDER_TO_LEGACY,
  COURSE_CATALOG,
  COURSES,
  LEGACY_ALUMNI_ORDER_TO_ORDER,
  isCourse,
  type AlumniListItem,
  type AlumniOrder,
  type Course,
  type LegacyAlumniOrder,
} from "$lib/domain";
import { db } from "$lib/server/index";

const PAGE_SIZE = 600;
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

const ORDER_BY: Record<AlumniOrder, string> = {
  nome: "lower(e.Nome), e.ID",
  cursoIngresso: "e.Curso, e.AnoInicio, lower(e.Nome), e.ID",
  cursoSaida: "e.Curso, e.AnoTermino, lower(e.Nome), e.ID",
  ingressoCurso: "e.AnoInicio, e.Curso, lower(e.Nome), e.ID",
  ingressoNome: "e.AnoInicio, lower(e.Nome), e.ID",
  saidaCurso: "e.AnoTermino, e.Curso, lower(e.Nome), e.ID",
  saidaNome: "e.AnoTermino, lower(e.Nome), e.ID",
};

interface AlumniRow {
  ID: number;
  Nome: string;
  Apelidos: string | null;
  Curso: string | null;
  AnoInicio: number | null;
  AnoTermino: number | null;
  NomeMiniaturaStored: string | null;
}

interface CountRow {
  total: number;
}

function all<T>(sql: string, params: unknown[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (queryError, rows: T[]) => {
      if (queryError) {
        reject(queryError);
        return;
      }

      resolve(rows);
    });
  });
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

function isAlumniOrder(value: string | null): value is AlumniOrder {
  return value !== null && Object.hasOwn(ALUMNI_ORDER_TO_LEGACY, value);
}

function isLegacyOrder(value: string | null): value is LegacyAlumniOrder {
  return value !== null && Object.hasOwn(LEGACY_ALUMNI_ORDER_TO_ORDER, value);
}

function normalizeOrder(url: URL): AlumniOrder {
  const modernOrder = url.searchParams.get("ordem");
  if (isAlumniOrder(modernOrder)) {
    return modernOrder;
  }

  const legacyOrder = url.searchParams.get("ORDEM");
  if (isLegacyOrder(legacyOrder)) {
    return LEGACY_ALUMNI_ORDER_TO_ORDER[legacyOrder];
  }

  return "nome";
}

function normalizePage(value: string | null): number {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return 1;
  }

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

function normalizeSearch(value: string | null): string {
  return value?.trim().slice(0, 120) ?? "";
}

function normalizeCourse(url: URL): Course | undefined {
  const courses = url.searchParams.getAll("curso");
  if (courses.length !== 1) {
    return undefined;
  }

  const course = courses[0];
  return isCourse(course) ? course : undefined;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

function toOptionalText(value: string | null): string | undefined {
  const text = value?.trim();
  return text || undefined;
}

function toOptionalYear(value: number | null): number | undefined {
  return value !== null && Number.isInteger(value) ? value : undefined;
}

function mapAlumnus(row: AlumniRow): AlumniListItem {
  return {
    id: row.ID,
    name: row.Nome,
    nickname: toOptionalText(row.Apelidos),
    course: toOptionalText(row.Curso),
    startYear: toOptionalYear(row.AnoInicio),
    endYear: toOptionalYear(row.AnoTermino),
    thumbnail: toOptionalText(row.NomeMiniaturaStored),
  };
}

export async function _loadAlumniList(url: URL, forcedCourse?: Course) {
  const busca = normalizeSearch(url.searchParams.get("busca"));
  const curso = forcedCourse ?? normalizeCourse(url);
  const ordem = normalizeOrder(url);
  const recentes =
    url.searchParams.get("recentes") === "1" ||
    url.searchParams.get("Restricao") === "LAST";
  const requestedPage = normalizePage(url.searchParams.get("pagina"));

  const conditions = ["e.Excluido = 0"];
  const params: unknown[] = [];

  if (busca) {
    conditions.push("e.Nome LIKE ? ESCAPE '\\'");
    params.push(`%${escapeLike(busca)}%`);
  }

  if (curso) {
    conditions.push("e.Curso = ?");
    params.push(curso);
  }

  if (recentes) {
    conditions.push("e.DtCadastro > ?");
    params.push(Date.now() - THIRTY_DAYS_IN_MS);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const count = await get<CountRow>(
    `SELECT COUNT(*) AS total FROM ExAlunos AS e ${whereClause}`,
    params,
  );
  const total = count?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const orderBy = recentes ? "e.DtCadastro DESC, e.ID DESC" : ORDER_BY[ordem];
  const basePath = forcedCourse
    ? `/exalunos/curso/${COURSE_CATALOG[forcedCourse].slug}`
    : "/exalunos_lista";
  const normalizedUrl = new URL(basePath, url);

  if (busca) normalizedUrl.searchParams.set("busca", busca);
  if (ordem !== "nome") normalizedUrl.searchParams.set("ordem", ordem);
  if (recentes) normalizedUrl.searchParams.set("recentes", "1");
  if (page > 1) normalizedUrl.searchParams.set("pagina", String(page));

  const normalizedPath = `${normalizedUrl.pathname}${normalizedUrl.search}`;
  if (`${url.pathname}${url.search}` !== normalizedPath) {
    redirect(308, normalizedPath);
  }

  const noindex = Boolean(busca || ordem !== "nome" || recentes);
  const canonicalPath =
    !noindex && page > 1 ? `${basePath}?pagina=${page}` : basePath;

  const rows = await all<AlumniRow>(
    `SELECT
      e.ID,
      e.Nome,
      e.Apelidos,
      e.Curso,
      e.AnoInicio,
      e.AnoTermino,
      foto.NomeMiniaturaStored
    FROM ExAlunos AS e
    LEFT JOIN Fotos AS foto ON foto.idFoto = (
      SELECT f.idFoto
      FROM Fotos AS f
      WHERE f.idExAlunoUpload = e.ID
        AND f.Excluido = 0
        AND f.FotoPessoal = 1
      ORDER BY f.idFoto DESC
      LIMIT 1
    )
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );

  return {
    alunos: rows.map(mapAlumnus),
    courseLanding: forcedCourse
      ? {
          code: forcedCourse,
          ...COURSE_CATALOG[forcedCourse],
        }
      : undefined,
    filters: { busca, curso, ordem, recentes },
    canonicalPath,
    noindex,
    pagination: { page, totalPages, total },
  };
}

export const load: PageServerLoad = async ({ url }) => {
  const course = normalizeCourse(url);
  return _loadAlumniList(url, course);
};
