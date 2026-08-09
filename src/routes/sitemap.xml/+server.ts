import type { RequestHandler } from "./$types";
import { db } from "$lib/server/index";

const SITE_URL = "https://etfsp.com";

const STATIC_PATHS = [
  "/",
  "/exalunos",
  "/exalunos_lista",
  "/lista_foto",
  "/novocadastro",
  "/cadfoto",
  "/politica-de-privacidade",
] as const;

interface AlumniSitemapRow {
  ID: number;
  DtCadastro: number | null;
}

function all<T>(sql: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, (queryError, rows: T[]) => {
      if (queryError) {
        reject(queryError);
        return;
      }

      resolve(rows);
    });
  });
}

function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character] as string,
  );
}

function validLastModified(timestamp: number | null): string | undefined {
  if (
    timestamp === null ||
    !Number.isSafeInteger(timestamp) ||
    timestamp <= 0
  ) {
    return undefined;
  }

  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function urlEntry(location: string, lastModified?: string): string {
  return [
    "  <url>",
    `    <loc>${escapeXml(location)}</loc>`,
    ...(lastModified ? [`    <lastmod>${lastModified}</lastmod>`] : []),
    "  </url>",
  ].join("\n");
}

export const GET: RequestHandler = async () => {
  const alumni = await all<AlumniSitemapRow>(
    `SELECT ID, DtCadastro
    FROM ExAlunos
    WHERE Excluido = 0
    ORDER BY ID`,
  );

  const entries = [
    ...STATIC_PATHS.map((path) => urlEntry(new URL(path, SITE_URL).href)),
    ...alumni.map((person) => {
      const profileUrl = new URL("/detalhe_exaluno", SITE_URL);
      profileUrl.searchParams.set("id", String(person.ID));
      return urlEntry(profileUrl.href, validLastModified(person.DtCadastro));
    }),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
