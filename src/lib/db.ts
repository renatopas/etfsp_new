import { default as sqlite } from "sqlite3";

console.log(sqlite);

if (process.env.NODE_ENV !== "production") {
  sqlite.verbose();
}

export const db = new sqlite.Database("db.sqlite3");
