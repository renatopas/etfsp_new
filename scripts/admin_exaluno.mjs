import { access, readFile, realpath, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import sqlite3 from "sqlite3";

const MAX_NAME_LENGTH = 200;
const MAX_REASON_LENGTH = 200;
const MAX_RESULTS = 20;
const MIGRATION_ID = "2026-11-10-admin-exaluno";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION_PATH = path.join(
  SCRIPT_DIR,
  "migrations",
  `${MIGRATION_ID}.sql`,
);

export class UserError extends Error {}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => (error ? reject(error) : resolve(row)));
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) =>
      error ? reject(error) : resolve(rows),
    );
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function callback(error) {
      if (error) reject(error);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

function exec(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (error) => (error ? reject(error) : resolve()));
  });
}

export function closeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.close((error) => (error ? reject(error) : resolve()));
  });
}

function openDatabase(filename) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      filename,
      sqlite3.OPEN_READWRITE,
      async (error) => {
        if (error) {
          reject(error);
          return;
        }
        try {
          await exec(
            db,
            "PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;",
          );
          resolve(db);
        } catch (configurationError) {
          db.close(() => reject(configurationError));
        }
      },
    );
  });
}

async function validateDatabaseFile(configuredPath) {
  if (!configuredPath?.trim()) {
    throw new UserError("DB_PATH não está configurado.");
  }

  let resolved;
  try {
    resolved = await realpath(configuredPath);
    const file = await stat(resolved);
    if (!file.isFile()) throw new Error("not a file");
    await access(resolved, fsConstants.R_OK | fsConstants.W_OK);
  } catch {
    throw new UserError("O banco configurado não existe ou não é gravável.");
  }
  return resolved;
}

async function requireColumns(db, table, expectedColumns) {
  const rows = await all(db, `PRAGMA table_info(${table})`);
  const columns = new Set(rows.map((row) => row.name));
  if (expectedColumns.some((column) => !columns.has(column))) {
    throw new UserError("O banco configurado possui schema incompatível.");
  }
}

export async function validateBaseSchema(db) {
  await requireColumns(db, "ExAlunos", [
    "ID",
    "Nome",
    "Curso",
    "AnoInicio",
    "AnoTermino",
    "Excluido",
    "DtAtualizacao",
  ]);
  await requireColumns(db, "Fotos", ["idFoto", "idExAlunoUpload", "Excluido"]);
  await requireColumns(db, "SchemaMigrations", ["ID", "AppliedAt"]);
}

export async function validateAdminSchema(db) {
  await requireColumns(db, "AdminAudit", [
    "ID",
    "Acao",
    "ExAlunoID",
    "Operador",
    "Motivo",
    "Data",
  ]);
  await requireColumns(db, "AdminAuditFotos", ["AdminAuditID", "FotoID"]);
  const migration = await get(
    db,
    "SELECT 1 AS found FROM SchemaMigrations WHERE ID = ?",
    [MIGRATION_ID],
  );
  if (!migration) {
    throw new UserError(
      "A migração administrativa não foi aplicada. Execute o subcomando migrar.",
    );
  }
}

export async function openConfiguredDatabase() {
  const filename = await validateDatabaseFile(process.env.DB_PATH);
  let db;
  try {
    db = await openDatabase(filename);
    await validateBaseSchema(db);
    return db;
  } catch (error) {
    if (db) await closeDatabase(db).catch(() => {});
    if (error instanceof UserError) throw error;
    throw new UserError("Não foi possível abrir o banco configurado.");
  }
}

export function parsePositiveId(value) {
  if (!/^[1-9]\d*$/.test(value ?? "")) {
    throw new UserError("Informe um ID inteiro positivo.");
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    throw new UserError("Informe um ID inteiro positivo.");
  }
  return id;
}

export function escapeLike(value) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function validateReason(value) {
  const reason = value.trim();
  if (!reason || reason.length > MAX_REASON_LENGTH) {
    throw new UserError(
      `O motivo deve ter entre 1 e ${MAX_REASON_LENGTH} caracteres.`,
    );
  }
  return reason;
}

function validateOperator(value) {
  const operator = value?.trim() ?? "";
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(operator)) {
    throw new UserError(
      "ADMIN_OPERATOR deve identificar o usuário SSH com 1 a 64 caracteres simples.",
    );
  }
  return operator;
}

export async function searchAlumni(db, name) {
  const normalized = name.trim();
  if (!normalized || normalized.length > MAX_NAME_LENGTH) {
    throw new UserError(
      `O nome deve ter entre 1 e ${MAX_NAME_LENGTH} caracteres.`,
    );
  }
  return all(
    db,
    `SELECT ID, Nome, Curso, AnoInicio, AnoTermino, Excluido
       FROM ExAlunos
      WHERE Nome LIKE ? ESCAPE '\\'
      ORDER BY Nome, ID
      LIMIT ?`,
    [`%${escapeLike(normalized)}%`, MAX_RESULTS],
  );
}

export async function getAlumnus(db, id) {
  return get(
    db,
    `SELECT
       e.ID,
       e.Nome,
       e.Curso,
       e.AnoInicio,
       e.AnoTermino,
       e.Excluido,
       SUM(CASE WHEN f.Excluido = 0 THEN 1 ELSE 0 END) AS FotosAtivas,
       SUM(CASE WHEN f.Excluido = 1 THEN 1 ELSE 0 END) AS FotosExcluidas
     FROM ExAlunos AS e
     LEFT JOIN Fotos AS f ON f.idExAlunoUpload = e.ID
     WHERE e.ID = ?
     GROUP BY e.ID, e.Nome, e.Curso, e.AnoInicio, e.AnoTermino, e.Excluido`,
    [id],
  );
}

function actionConfiguration(action) {
  if (action === "desativar") {
    return { expected: 0, target: 1 };
  }
  if (action === "reativar") {
    return { expected: 1, target: 0 };
  }
  throw new UserError("Ação administrativa inválida.");
}

async function insertAuditPhotos(db, auditId, photoIds) {
  for (const photoId of photoIds) {
    await run(
      db,
      "INSERT INTO AdminAuditFotos (AdminAuditID, FotoID) VALUES (?, ?)",
      [auditId, photoId],
    );
  }
}

export async function changeAlumnusStatus(
  db,
  { id, action, operator, reason, now = Date.now() },
) {
  const { expected, target } = actionConfiguration(action);
  const safeOperator = validateOperator(operator);
  const safeReason = validateReason(reason);

  await validateAdminSchema(db);
  await exec(db, "BEGIN IMMEDIATE");
  try {
    const alumnus = await get(
      db,
      "SELECT ID FROM ExAlunos WHERE ID = ? AND Excluido = ?",
      [id, expected],
    );
    if (!alumnus) {
      throw new UserError(
        action === "desativar"
          ? "O ex-aluno não existe ou já está desativado."
          : "O ex-aluno não existe ou já está ativo.",
      );
    }

    const photoRows = await all(
      db,
      "SELECT idFoto FROM Fotos WHERE idExAlunoUpload = ? AND Excluido = ? ORDER BY idFoto",
      [id, expected],
    );
    const photoIds = photoRows.map((row) => row.idFoto);

    const alumnusUpdate = await run(
      db,
      "UPDATE ExAlunos SET Excluido = ?, DtAtualizacao = ? WHERE ID = ? AND Excluido = ?",
      [target, now, id, expected],
    );
    if (alumnusUpdate.changes !== 1) {
      throw new UserError(
        "O cadastro mudou durante a operação. Tente novamente.",
      );
    }

    await run(
      db,
      "UPDATE Fotos SET Excluido = ? WHERE idExAlunoUpload = ? AND Excluido = ?",
      [target, id, expected],
    );

    const audit = await run(
      db,
      `INSERT INTO AdminAudit (Acao, ExAlunoID, Operador, Motivo, Data)
       VALUES (?, ?, ?, ?, ?)`,
      [action, id, safeOperator, safeReason, now],
    );
    await insertAuditPhotos(db, audit.lastID, photoIds);
    await exec(db, "COMMIT");
    return { photoIds };
  } catch (error) {
    await exec(db, "ROLLBACK").catch(() => {});
    throw error;
  }
}

export async function runMigration(db) {
  await validateBaseSchema(db);
  const migrationSql = await readFile(MIGRATION_PATH, "utf8");
  try {
    await exec(db, migrationSql);
  } catch (error) {
    await exec(db, "ROLLBACK").catch(() => {});
    throw error;
  }
  await validateAdminSchema(db);
}

function formatValue(value) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

function printAlumnus(row) {
  console.log(`ID: ${row.ID}`);
  console.log(`Nome: ${row.Nome}`);
  console.log(`Curso: ${formatValue(row.Curso)}`);
  console.log(`Ingresso: ${formatValue(row.AnoInicio)}`);
  console.log(`Término: ${formatValue(row.AnoTermino)}`);
  console.log(`Situação: ${row.Excluido === 0 ? "ativo" : "desativado"}`);
  console.log(`Fotos ativas: ${row.FotosAtivas}`);
  console.log(`Fotos desativadas: ${row.FotosExcluidas}`);
}

function parseSingleOption(args, option) {
  if (args.length !== 2 || args[0] !== option || !args[1]) {
    throw new UserError(`Uso esperado: ${option} <valor>.`);
  }
  return args[1];
}

function printUsage() {
  console.log(`Uso:
  pnpm admin:exaluno buscar --nome "Nome"
  pnpm admin:exaluno consultar --id 123
  pnpm admin:exaluno desativar --id 123
  pnpm admin:exaluno reativar --id 123
  pnpm admin:exaluno migrar`);
}

async function promptForChange(row, action) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new UserError("A operação exige um terminal interativo.");
  }

  printAlumnus(row);
  console.log();
  if (action === "desativar") {
    console.log(
      "Todas as fotos ativas enviadas por este ex-aluno serão desativadas.",
    );
  } else {
    console.log(
      "Todas as fotos desativadas enviadas por este ex-aluno serão reativadas, inclusive as excluídas anteriormente por outro motivo.",
    );
  }
  console.log(
    "Não informe e-mail, CPF, telefone, endereço nem copie a solicitação no motivo.",
  );

  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const reason = validateReason(await prompt.question("Motivo curto: "));
    const confirmation = (
      await prompt.question(`Digite o ID ${row.ID} para confirmar: `)
    ).trim();
    if (confirmation !== String(row.ID)) {
      throw new UserError(
        "Confirmação incorreta. Nenhuma alteração foi feita.",
      );
    }
    return reason;
  } finally {
    prompt.close();
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  const db = await openConfiguredDatabase();
  try {
    if (command === "migrar") {
      if (args.length !== 0)
        throw new UserError("O subcomando migrar não aceita argumentos.");
      await runMigration(db);
      console.log("Migração administrativa aplicada com sucesso.");
      return;
    }

    if (command === "buscar") {
      const name = parseSingleOption(args, "--nome");
      const rows = await searchAlumni(db, name);
      if (rows.length === 0) {
        console.log("Nenhum ex-aluno encontrado.");
        return;
      }
      for (const row of rows) {
        console.log(
          `${row.ID} | ${row.Nome} | ${formatValue(row.Curso)} | ${formatValue(row.AnoInicio)}–${formatValue(row.AnoTermino)} | ${row.Excluido === 0 ? "ativo" : "desativado"}`,
        );
      }
      return;
    }

    if (!["consultar", "desativar", "reativar"].includes(command)) {
      throw new UserError("Subcomando desconhecido.");
    }

    const id = parsePositiveId(parseSingleOption(args, "--id"));
    const row = await getAlumnus(db, id);
    if (!row) throw new UserError("Ex-aluno não encontrado.");

    if (command === "consultar") {
      printAlumnus(row);
      return;
    }

    if (command === "desativar" && row.Excluido !== 0) {
      throw new UserError("O ex-aluno já está desativado.");
    }
    if (command === "reativar" && row.Excluido !== 1) {
      throw new UserError("O ex-aluno já está ativo.");
    }

    const operator = validateOperator(process.env.ADMIN_OPERATOR);
    const reason = await promptForChange(row, command);
    const result = await changeAlumnusStatus(db, {
      id,
      action: command,
      operator,
      reason,
    });
    console.log(
      `${command === "desativar" ? "Desativação" : "Reativação"} concluída. Fotos alteradas: ${result.photoIds.length}.`,
    );
  } finally {
    await closeDatabase(db);
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main().catch((error) => {
    if (error instanceof UserError) {
      console.error(`Erro: ${error.message}`);
    } else {
      console.error("Erro: a operação administrativa não pôde ser concluída.");
    }
    process.exitCode = 1;
  });
}
