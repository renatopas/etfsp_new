import { env } from "$env/dynamic/private";
import { error, type RequestHandler } from "@sveltejs/kit";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { contentType } from "mime-types";
import { building } from "$app/environment";
import { FOTOS_DIR } from "$lib/server";

export const GET: RequestHandler = async ({ params }) => {
  if (params.file === undefined) {
    error(404);
  }
  try {
    let data = await readFile(path.join(FOTOS_DIR, params.file));
    const content_type = contentType(params.file as string);
    if (!content_type) {
      error(404, { message: "wahwahwahwa" });
    }
    return new Response(data, {
      headers: {
        "content-type": content_type,
        "cache-control": "max-age=86400, public",
      },
    });
  } catch (e) {
    error(404, { message: String(e) });
  }
};
