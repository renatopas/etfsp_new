import { default as sqlite } from "sqlite3";
console.log(sqlite);
sqlite.verbose();

export const db = new sqlite.Database("db.sqlite3");
