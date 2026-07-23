import { json, type RequestHandler } from "@sveltejs/kit";
import { db } from "$lib/server/index";

export interface SearchResult {
  id: number;
  name: string;
  nickname?: string;
  course?: string;
  startYear?: number;
  endYear?: number;
}
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}
export const GET: RequestHandler = async ({ url }) => {
  const name = (url.searchParams.get("name") ?? "").trim();
  if (name.length < 3) return json([]);
  const rows = await new Promise<SearchResult[]>((resolve, reject) =>
    db.all(
      "SELECT ID AS id, Nome AS name, Apelidos AS nickname, Curso AS course, AnoInicio AS startYear, AnoTermino AS endYear FROM ExAlunos WHERE Excluido = 0 AND Nome LIKE ? ESCAPE '\\' ORDER BY Nome LIMIT 10",
      [`%${escapeLike(name)}%`],
      (queryError, results: SearchResult[]) =>
        queryError ? reject(queryError) : resolve(results),
    ),
  );
  return json(rows);
};
