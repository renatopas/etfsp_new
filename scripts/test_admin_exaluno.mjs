import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import sqlite3 from "sqlite3";
import {
  changeAlumnusStatus,
  closeDatabase,
  escapeLike,
  parsePositiveId,
  runMigration,
  searchAlumni,
  UserError,
  validateReason,
} from "./admin_exaluno.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const INITIAL_SQL_PATH = path.join(SCRIPT_DIR, "initial.sql");

function openDatabase(filename) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(filename, (error) =>
      error ? reject(error) : resolve(db),
    );
  });
}

function exec(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (error) => (error ? reject(error) : resolve()));
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

async function withDatabase(callback, schema) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "etfsp-admin-test-"));
  const filename = path.join(directory, "db.sqlite3");
  const db = await openDatabase(filename);
  try {
    await exec(db, "PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
    await exec(db, schema ?? (await readFile(INITIAL_SQL_PATH, "utf8")));
    await callback(db);
  } finally {
    await closeDatabase(db);
    await rm(directory, { recursive: true, force: true });
  }
}

async function insertAlumnus(db, name = "Pessoa Fictícia") {
  const result = await run(
    db,
    `INSERT INTO ExAlunos (Nome, Curso, AnoInicio, AnoTermino)
     VALUES (?, 'M', 1980, 1984)`,
    [name],
  );
  return result.lastID;
}

async function insertPhoto(db, alumnusId, suffix, excluded = 0) {
  const result = await run(
    db,
    `INSERT INTO Fotos (
       NomeArqOriginal, NomeArqStored, NomeMiniaturaStored,
       idExAlunoUpload, FotoPessoal, Excluido
     ) VALUES (?, ?, ?, ?, 0, ?)`,
    [
      `original-${suffix}.jpg`,
      `${suffix}.webp`,
      `${suffix}-mini.webp`,
      alumnusId,
      excluded,
    ],
  );
  return result.lastID;
}

test("valida argumentos locais sem aceitar IDs ou motivos ambíguos", () => {
  assert.equal(parsePositiveId("123"), 123);
  assert.throws(() => parsePositiveId("0"), UserError);
  assert.throws(() => parsePositiveId("1 OR 1=1"), UserError);
  assert.equal(
    validateReason(" solicitação confirmada "),
    "solicitação confirmada",
  );
  assert.throws(() => validateReason(" "), UserError);
  assert.throws(() => validateReason("x".repeat(201)), UserError);
  assert.equal(escapeLike("100%_\\"), "100\\%\\_\\\\");
});

test("migração cria a auditoria em um schema anterior", async () => {
  const legacySchema = `
    CREATE TABLE ExAlunos (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Nome TEXT NOT NULL,
      Curso TEXT,
      AnoInicio INTEGER,
      AnoTermino INTEGER,
      Excluido INTEGER NOT NULL DEFAULT 0,
      DtAtualizacao INTEGER
    ) STRICT;
    CREATE TABLE SchemaMigrations (
      ID TEXT PRIMARY KEY,
      AppliedAt INTEGER NOT NULL
    ) STRICT;
    CREATE TABLE Fotos (
      idFoto INTEGER PRIMARY KEY AUTOINCREMENT,
      idExAlunoUpload INTEGER NOT NULL REFERENCES ExAlunos (ID),
      Excluido INTEGER NOT NULL DEFAULT 0
    ) STRICT;
  `;

  await withDatabase(async (db) => {
    await runMigration(db);
    await runMigration(db);
    const migration = await get(
      db,
      "SELECT COUNT(*) AS total FROM SchemaMigrations WHERE ID = ?",
      ["2026-11-10-admin-exaluno"],
    );
    assert.equal(migration.total, 1);
    assert.deepEqual(
      (
        await all(
          db,
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'AdminAudit%' ORDER BY name",
        )
      ).map((row) => row.name),
      ["AdminAudit", "AdminAuditFotos"],
    );
  }, legacySchema);
});

test("busca por nome trata curingas como caracteres literais", async () => {
  await withDatabase(async (db) => {
    const expectedId = await insertAlumnus(db, "Pessoa 100%_\\ Fictícia");
    await insertAlumnus(db, "Pessoa 100ABC Fictícia");
    const rows = await searchAlumni(db, "%_\\");
    assert.deepEqual(
      rows.map((row) => row.ID),
      [expectedId],
    );
  });
});

test("desativação e reativação alteram aluno, todas as fotos e auditoria", async () => {
  await withDatabase(async (db) => {
    const alumnusId = await insertAlumnus(db);
    const otherId = await insertAlumnus(db, "Outra Pessoa Fictícia");
    const activePhoto1 = await insertPhoto(db, alumnusId, "ativa-1");
    const activePhoto2 = await insertPhoto(db, alumnusId, "ativa-2");
    const previouslyExcluded = await insertPhoto(db, alumnusId, "excluida", 1);
    const otherPhoto = await insertPhoto(db, otherId, "outra");

    const deactivation = await changeAlumnusStatus(db, {
      id: alumnusId,
      action: "desativar",
      operator: "ubuntu",
      reason: "solicitação confirmada pelo titular",
      now: 1_794_278_400_000,
    });
    assert.deepEqual(deactivation.photoIds, [activePhoto1, activePhoto2]);
    assert.equal(
      (await get(db, "SELECT Excluido FROM ExAlunos WHERE ID = ?", [alumnusId]))
        .Excluido,
      1,
    );
    assert.deepEqual(
      (
        await all(
          db,
          "SELECT idFoto, Excluido FROM Fotos WHERE idExAlunoUpload = ? ORDER BY idFoto",
          [alumnusId],
        )
      ).map((row) => [row.idFoto, row.Excluido]),
      [
        [activePhoto1, 1],
        [activePhoto2, 1],
        [previouslyExcluded, 1],
      ],
    );
    assert.equal(
      (
        await get(db, "SELECT Excluido FROM Fotos WHERE idFoto = ?", [
          otherPhoto,
        ])
      ).Excluido,
      0,
    );

    const reactivation = await changeAlumnusStatus(db, {
      id: alumnusId,
      action: "reativar",
      operator: "ubuntu",
      reason: "correção administrativa",
      now: 1_794_278_500_000,
    });
    assert.deepEqual(reactivation.photoIds, [
      activePhoto1,
      activePhoto2,
      previouslyExcluded,
    ]);
    assert.equal(
      (await get(db, "SELECT Excluido FROM ExAlunos WHERE ID = ?", [alumnusId]))
        .Excluido,
      0,
    );
    assert.deepEqual(
      (
        await all(
          db,
          "SELECT Excluido FROM Fotos WHERE idExAlunoUpload = ? ORDER BY idFoto",
          [alumnusId],
        )
      ).map((row) => row.Excluido),
      [0, 0, 0],
    );

    assert.deepEqual(
      await all(
        db,
        "SELECT Acao, Operador, Motivo, Data FROM AdminAudit ORDER BY ID",
      ),
      [
        {
          Acao: "desativar",
          Operador: "ubuntu",
          Motivo: "solicitação confirmada pelo titular",
          Data: 1_794_278_400_000,
        },
        {
          Acao: "reativar",
          Operador: "ubuntu",
          Motivo: "correção administrativa",
          Data: 1_794_278_500_000,
        },
      ],
    );
    assert.equal(
      (await get(db, "SELECT COUNT(*) AS total FROM AdminAuditFotos")).total,
      5,
    );
  });
});

test("falha na auditoria desfaz alterações do aluno e das fotos", async () => {
  await withDatabase(async (db) => {
    const alumnusId = await insertAlumnus(db);
    const photoId = await insertPhoto(db, alumnusId, "rollback");
    await exec(
      db,
      `CREATE TRIGGER impedir_auditoria
       BEFORE INSERT ON AdminAudit
       BEGIN
         SELECT RAISE(ABORT, 'falha sintética');
       END;`,
    );

    await assert.rejects(
      changeAlumnusStatus(db, {
        id: alumnusId,
        action: "desativar",
        operator: "ubuntu",
        reason: "teste de rollback",
      }),
    );
    assert.equal(
      (await get(db, "SELECT Excluido FROM ExAlunos WHERE ID = ?", [alumnusId]))
        .Excluido,
      0,
    );
    assert.equal(
      (await get(db, "SELECT Excluido FROM Fotos WHERE idFoto = ?", [photoId]))
        .Excluido,
      0,
    );
    assert.equal(
      (await get(db, "SELECT COUNT(*) AS total FROM AdminAudit")).total,
      0,
    );
  });
});
