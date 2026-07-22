import { default as sqlite } from "sqlite3";
import { building } from "$app/environment";
import path from "node:path";
import { env } from "$env/dynamic/private";

export let db: sqlite.Database;

// prevents docker build errors
if (!building) {
  if (!env.DB_PATH) {
    throw new Error("DB_PATH must be set");
  }
  db = new sqlite.Database(
    env.DB_PATH,
    sqlite.OPEN_READWRITE | sqlite.OPEN_FULLMUTEX,
  );
}

export let FOTOS_DIR: string;

if (!building) {
  if (!env.FOTOS_DIR) {
    throw new Error("FOTOS_DIR must be set");
  }
  FOTOS_DIR = path.resolve(env.FOTOS_DIR as string);
}
