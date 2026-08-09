import type { RequestHandler } from "./$types";
import { db } from "$lib/server/index";
import { absoluteSiteUrl } from "$lib/site";

const MAX_URLS = 50_000;

const STATIC_PATHS = [
  "/",
  "/exalunos",
  "/exalunos_lista",
  "/lista_foto",
  "/politica-de-privacidade",
] as const;

interface AlumniSitemapRow {
  ID: number;
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

function urlEntry(location: string): string {
  return ["  <url>", `    <loc>${escapeXml(location)}</loc>`, "  </url>"].join(
    "\n",
  );
}

export const GET: RequestHandler = async () => {
  const alumni = await all<AlumniSitemapRow>(
    `SELECT ID
    FROM ExAlunos
    WHERE Excluido = 0
    ORDER BY ID
    LIMIT ${MAX_URLS - STATIC_PATHS.length + 1}`,
  );

  if (alumni.length + STATIC_PATHS.length > MAX_URLS) {
    throw new Error("Sitemap URL limit exceeded");
  }

  const entries = [
    ...STATIC_PATHS.map((path) => urlEntry(absoluteSiteUrl(path))),
    ...alumni.map((person) =>
      urlEntry(absoluteSiteUrl(`/exalunos/${person.ID}`)),
    ),
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
