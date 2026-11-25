import type { PageServerLoad } from "./$types";
import type { RecentPhoto } from "$lib/domain";
import { db } from "$lib/server/index";
import {
  PUBLIC_PHOTO_COLUMNS,
  VISIBLE_PHOTO_CLAUSE,
  toPublicPhoto,
  type PublicPhotoRow,
} from "$lib/server/public-photos";

const RECENT_PHOTOS_LIMIT = 8;
const GENERAL_PHOTOS_WHERE = `WHERE ${VISIBLE_PHOTO_CLAUSE} AND f.Carometro = 0`;

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
      `SELECT COUNT(*) AS total FROM Fotos AS f ${GENERAL_PHOTOS_WHERE}`,
    ),
    all<PublicPhotoRow>(
      `SELECT ${PUBLIC_PHOTO_COLUMNS} FROM Fotos AS f ${GENERAL_PHOTOS_WHERE} ORDER BY f.idFoto DESC LIMIT ?`,
      [RECENT_PHOTOS_LIMIT],
    ),
  ]);

  const recentPhotos: RecentPhoto[] = rows.map((row) => {
    const { title, course, photoYear, thumbnailUrl } = toPublicPhoto(row);
    return { title, course, photoYear, thumbnailUrl };
  });

  return {
    stats: { alumni: alumni?.total ?? 0, photos: photos?.total ?? 0 },
    recentPhotos,
  };
};
