import type sqlite from "sqlite3";

const SOCIAL_COLUMNS = ["Instagram", "Facebook", "LinkedIn"] as const;
const SOCIAL_MIGRATION = "2026-07-29-add-social-networks";
const WHATSAPP_MIGRATION = "2026-07-29-add-whatsapp";

function all<T>(
  db: sqlite.Database,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (queryError, rows: T[]) => {
      if (queryError) {
        reject(queryError);
        return;
      }
      resolve(rows);
    });
  });
}

function run(
  db: sqlite.Database,
  sql: string,
  params: unknown[] = [],
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (queryError) => {
      if (queryError) {
        reject(queryError);
        return;
      }
      resolve();
    });
  });
}

export async function migrate(db: sqlite.Database): Promise<void> {
  await run(db, "BEGIN IMMEDIATE");
  try {
    await run(
      db,
      `CREATE TABLE IF NOT EXISTS SchemaMigrations (
        ID TEXT PRIMARY KEY,
        AppliedAt INTEGER NOT NULL
      ) STRICT`,
    );

    const columns = await all<{ name: string }>(
      db,
      "PRAGMA table_info(ExAlunos)",
    );
    const existingColumns = new Set(columns.map(({ name }) => name));

    for (const column of SOCIAL_COLUMNS) {
      if (!existingColumns.has(column)) {
        await run(db, `ALTER TABLE ExAlunos ADD COLUMN ${column} TEXT`);
      }
    }

    await run(
      db,
      `INSERT OR IGNORE INTO SchemaMigrations (ID, AppliedAt)
       VALUES (?, ?)`,
      [SOCIAL_MIGRATION, Date.now()],
    );

    if (!existingColumns.has("WhatsApp")) {
      await run(db, "ALTER TABLE ExAlunos ADD COLUMN WhatsApp TEXT");
    }

    await run(
      db,
      `INSERT OR IGNORE INTO SchemaMigrations (ID, AppliedAt)
       VALUES (?, ?)`,
      [WHATSAPP_MIGRATION, Date.now()],
    );
    await run(db, "COMMIT");
  } catch (migrationError) {
    try {
      await run(db, "ROLLBACK");
    } catch {
      // Preserve the original migration error.
    }
    throw migrationError;
  }
}
