import dayjs from "dayjs";
import { default as sqlite } from "sqlite3";
import { default as relativeTime } from "dayjs/plugin/relativeTime";
import { default as pt } from "dayjs/locale/pt";
import { building } from "$app/environment";
import sharp from "sharp";

dayjs.extend(relativeTime);
dayjs.locale(pt);

export function prettyDateOffset(date: dayjs.ConfigType): string {
  return dayjs(date).fromNow();
}

if (process.env.NODE_ENV !== "production") {
  sqlite.verbose();
}

export let db: sqlite.Database;

// prevents docker build errors
if (!building) {
  db = new sqlite.Database(
    "db.sqlite3",
    sqlite.OPEN_READWRITE | sqlite.OPEN_FULLMUTEX,
  );
}
