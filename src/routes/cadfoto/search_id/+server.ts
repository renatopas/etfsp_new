import { db } from "$lib/server/index";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export interface SearchResult {
  ID: number;
  Nome: string;
}

async function searchName(name: string): Promise<SearchResult[]> {
  let escaped = `%${name.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
  console.debug(escaped);

  return new Promise((res, rej) => {
    db.all<SearchResult>(
      "SELECT ID, Nome FROM ExAlunos WHERE Nome LIKE ? ESCAPE '\\' AND Excluido = 0 ORDER BY Nome;",
      [escaped],
      (err, rows) => {
        if (err) {
          rej(err);
          return;
        }
        res(rows);
        return;
      },
    );
  });
}

export const GET: RequestHandler = async ({ url }) => {
  let req = url.searchParams;
  let search = req.get("name");
  if (search) {
    if (search.length > 3) {
      return json(await searchName(search));
    } else {
      return json([]);
    }
  } else {
    return error(400);
  }
};
