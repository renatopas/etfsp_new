import type { PageServerLoad } from "./$types";
import { isCourse, type PublicPhoto } from "$lib/domain";
import { db } from "$lib/server/index";
const PAGE_SIZE = 100;
const MIN_YEAR = 1909;
interface Row {
  TituloFoto: string | null;
  CursoFoto: string | null;
  TurmaFoto: string | null;
  AnoFoto: number | null;
  AnoFormatura: number | null;
  NomeMiniaturaStored: string;
  NomeArqStored: string;
}
function all<T>(sql: string, params: unknown[]): Promise<T[]> {
  return new Promise((resolve, reject) =>
    db.all(sql, params, (e, rows: T[]) => (e ? reject(e) : resolve(rows))),
  );
}
function get<T>(sql: string, params: unknown[]): Promise<T | undefined> {
  return new Promise((resolve, reject) =>
    db.get(sql, params, (e, row: T | undefined) =>
      e ? reject(e) : resolve(row),
    ),
  );
}
function text(value: string | null, max: number): string {
  return value?.trim().slice(0, max) ?? "";
}
function validYear(value: string | null): number | undefined {
  const n = value && /^\d{4}$/.test(value) ? Number(value) : undefined;
  return n && n >= MIN_YEAR && n <= new Date().getFullYear() ? n : undefined;
}
function positive(value: string | null): number | undefined {
  return value &&
    /^[1-9]\d*$/.test(value) &&
    Number.isSafeInteger(Number(value))
    ? Number(value)
    : undefined;
}
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}
function map(row: Row): PublicPhoto {
  return {
    title: row.TituloFoto?.trim() || undefined,
    course: isCourse(row.CursoFoto) ? row.CursoFoto : undefined,
    className: row.TurmaFoto?.trim() || undefined,
    photoYear: row.AnoFoto ?? undefined,
    graduationYear: row.AnoFormatura ?? undefined,
    thumbnailUrl: `/Fotos/${encodeURIComponent(row.NomeMiniaturaStored)}`,
    imageUrl: `/Fotos/${encodeURIComponent(row.NomeArqStored)}`,
  };
}
export const load: PageServerLoad = async ({ url }) => {
  const title = text(url.searchParams.get("titulo"), 250);
  const courseValue = url.searchParams.get("curso");
  const course = isCourse(courseValue) ? courseValue : undefined;
  const type =
    url.searchParams.get("tipo") === "carometro" ? "carometro" : "gerais";
  const photoFrom = validYear(url.searchParams.get("fotoDe"));
  const photoTo = validYear(url.searchParams.get("fotoAte"));
  const graduationFrom = validYear(url.searchParams.get("formaturaDe"));
  const graduationTo = validYear(url.searchParams.get("formaturaAte"));
  const alumnusId = positive(url.searchParams.get("idExAluno"));
  const requested = positive(url.searchParams.get("pagina")) ?? 1;
  const clauses = ["f.Excluido = 0", "f.Carometro = ?"];
  const params: unknown[] = [type === "carometro" ? 1 : 0];
  if (title) {
    clauses.push("f.TituloFoto LIKE ? ESCAPE '\\'");
    params.push(`%${escapeLike(title)}%`);
  }
  if (course) {
    clauses.push("f.CursoFoto = ?");
    params.push(course);
  }
  if (photoFrom) {
    clauses.push("f.AnoFoto >= ?");
    params.push(photoFrom);
  }
  if (photoTo) {
    clauses.push("f.AnoFoto <= ?");
    params.push(photoTo);
  }
  if (graduationFrom) {
    clauses.push("f.AnoFormatura >= ?");
    params.push(graduationFrom);
  }
  if (graduationTo) {
    clauses.push("f.AnoFormatura <= ?");
    params.push(graduationTo);
  }
  if (alumnusId) {
    clauses.push("f.idExAlunoUpload = ?");
    params.push(alumnusId);
  }
  const where = `WHERE ${clauses.join(" AND ")}`;
  const count = await get<{ total: number }>(
    `SELECT COUNT(*) AS total FROM Fotos AS f ${where}`,
    params,
  );
  const total = count?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requested, totalPages);
  const rows = await all<Row>(
    `SELECT f.TituloFoto,f.CursoFoto,f.TurmaFoto,f.AnoFoto,f.AnoFormatura,f.NomeMiniaturaStored,f.NomeArqStored FROM Fotos AS f ${where} ORDER BY f.idFoto DESC LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
  return {
    photos: rows.map(map),
    noindex: url.search.length > 0,
    filters: {
      title,
      course,
      type,
      photoFrom,
      photoTo,
      graduationFrom,
      graduationTo,
      alumnusId,
    },
    pagination: { page, total, totalPages },
  };
};
