import { default as sqlite } from "sqlite3";
import { building } from "$app/environment";
import path from "node:path";
import { env } from "$env/dynamic/private";
import { migrate } from "./migrations";

function openDatabase(filename: string): Promise<sqlite.Database> {
  return new Promise((resolve, reject) => {
    const database = new sqlite.Database(
      filename,
      sqlite.OPEN_READWRITE | sqlite.OPEN_FULLMUTEX,
      (openError) => {
        if (openError) {
          reject(openError);
          return;
        }
        database.configure("busyTimeout", 10_000);
        resolve(database);
      },
    );
  });
}

async function initializeDatabase(): Promise<sqlite.Database> {
  if (!env.DB_PATH) {
    throw new Error("DB_PATH must be set");
  }
  const database = await openDatabase(env.DB_PATH);
  try {
    await migrate(database);
    return database;
  } catch {
    database.close();
    throw new Error("Database migration failed");
  }
}

// The placeholder prevents database access during the Vite build.
export const db: sqlite.Database = building
  ? (undefined as unknown as sqlite.Database)
  : await initializeDatabase();

export let FOTOS_DIR: string;

if (!building) {
  if (!env.FOTOS_DIR) {
    throw new Error("FOTOS_DIR must be set");
  }
  FOTOS_DIR = path.resolve(env.FOTOS_DIR as string);
}
