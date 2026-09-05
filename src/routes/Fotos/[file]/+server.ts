import { error, type RequestHandler } from "@sveltejs/kit";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db, FOTOS_DIR } from "$lib/server/index";

function validName(name: string | undefined): name is string {
  return (
    name !== undefined &&
    name !== "" &&
    !name.includes("..") &&
    !/[\\/]/.test(name) &&
    path.basename(name) === name
  );
}
export const GET: RequestHandler = async ({ params }) => {
  if (!validName(params.file)) error(404, "Foto não encontrada.");
  const file = params.file;
  const exists = await new Promise<boolean>((resolve, reject) =>
    db.get(
      "SELECT 1 FROM Fotos WHERE Excluido = 0 AND (NomeArqStored = ? OR NomeMiniaturaStored = ?) LIMIT 1",
      [file, file],
      (queryError, row) =>
        queryError ? reject(queryError) : resolve(Boolean(row)),
    ),
  );
  if (!exists) error(404, "Foto não encontrada.");
  try {
    const data = await readFile(path.join(FOTOS_DIR, file));
    return new Response(data, {
      headers: {
        "content-type": "image/webp",
        "cache-control": "public, max-age=86400",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    error(404, "Foto não encontrada.");
  }
};
