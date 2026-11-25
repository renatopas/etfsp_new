import type { PageServerLoad } from "./$types";
import {
  ALUMNI_LIST_SELECT,
  toAlumniListItem,
  type AlumniListRow,
} from "$lib/server/alumni-list";
import { db } from "$lib/server/index";

const RECENT_ALUMNI_LIMIT = 6;

function all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) =>
    db.all(sql, params, (e, rows: T[]) => (e ? reject(e) : resolve(rows))),
  );
}

function get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) =>
    db.get(sql, params, (e, row: T | undefined) =>
      e ? reject(e) : resolve(row),
    ),
  );
}

export const load: PageServerLoad = async () => {
  const [alumni, photos, rows] = await Promise.all([
    get<{ total: number }>(
      "SELECT COUNT(*) AS total FROM ExAlunos AS e WHERE e.Excluido = 0",
    ),
    get<{ total: number }>(
      "SELECT COUNT(*) AS total FROM Fotos AS f WHERE f.Excluido = 0 AND f.Carometro = 0",
    ),
    all<AlumniListRow>(
      `${ALUMNI_LIST_SELECT}
    WHERE e.Excluido = 0
    ORDER BY e.DtCadastro DESC, e.ID DESC
    LIMIT ?`,
      [RECENT_ALUMNI_LIMIT],
    ),
  ]);

  return {
    stats: { alumni: alumni?.total ?? 0, photos: photos?.total ?? 0 },
    recentAlumni: rows.map(toAlumniListItem),
  };
};
