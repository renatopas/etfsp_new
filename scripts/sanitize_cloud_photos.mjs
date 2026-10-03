#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const MAX_PIXELS = 40_000_000;
const CONCURRENCY = 4;

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

function safeBasename(value, label) {
  if (
    typeof value !== "string" ||
    value === "" ||
    value === "." ||
    value === ".." ||
    path.basename(value) !== value ||
    /[\\/]/.test(value)
  ) {
    throw new Error(`${label} inválido`);
  }
  return value;
}

function within(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

async function main() {
  const [sourceArg, destinationArg, tasksArg, resultArg] =
    process.argv.slice(2);
  if (!sourceArg || !destinationArg || !tasksArg || !resultArg) {
    throw new Error("Argumentos obrigatórios ausentes.");
  }

  const sourceRoot = await fs.realpath(path.resolve(sourceArg));
  const destinationRoot = await fs.realpath(path.resolve(destinationArg));
  const tasks = JSON.parse(await fs.readFile(tasksArg, "utf8"));

  if (!Array.isArray(tasks)) {
    throw new Error("A lista de fotos é inválida.");
  }

  const existing = await fs.readdir(destinationRoot);
  if (existing.length !== 0) {
    throw new Error("O diretório de fotos de destino não está vazio.");
  }

  const results = new Array(tasks.length);
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const index = cursor++;
      const task = tasks[index];
      const id = Number(task?.id);
      if (!Number.isSafeInteger(id) || id <= 0) {
        throw new Error("Identificador de foto inválido.");
      }

      const sourceName = safeBasename(task.source, "Nome de origem");
      const storedName = safeBasename(task.stored, "Nome de saída");
      const thumbnailName = safeBasename(task.thumbnail, "Nome de miniatura");
      const sourceCandidate = path.resolve(sourceRoot, sourceName);
      let source;
      try {
        source = await fs.realpath(sourceCandidate);
      } catch {
        throw new Error(`Arquivo da foto de ID ${id} não encontrado.`);
      }
      const stored = path.resolve(destinationRoot, storedName);
      const thumbnail = path.resolve(destinationRoot, thumbnailName);

      if (
        !within(source, sourceRoot) ||
        !within(stored, destinationRoot) ||
        !within(thumbnail, destinationRoot)
      ) {
        throw new Error(
          `Foto ${id} resolveu para fora do diretório permitido.`,
        );
      }

      try {
        const original = await sharp(source, {
          failOn: "error",
          limitInputPixels: MAX_PIXELS,
        })
          .autoOrient()
          .webp({ quality: 85 })
          .toFile(stored);
        await sharp(source, {
          failOn: "error",
          limitInputPixels: MAX_PIXELS,
        })
          .autoOrient()
          .resize(320, 240, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(thumbnail);

        results[index] = {
          id,
          size: original.size,
          width: original.width,
          height: original.height,
        };
      } catch {
        throw new Error(`Não foi possível reprocessar a foto de ID ${id}.`);
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(CONCURRENCY, Math.max(tasks.length, 1)) },
      () => worker(),
    ),
  );
  await fs.writeFile(resultArg, JSON.stringify(results), {
    encoding: "utf8",
    flag: "wx",
  });
}

try {
  await main();
} catch (error) {
  fail(error instanceof Error ? error.message : "Falha ao sanitizar as fotos.");
}
