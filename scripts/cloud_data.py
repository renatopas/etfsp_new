#!/usr/bin/env python3
"""Build and validate privacy-safe data packages for Codex Cloud."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sqlite3
import subprocess
import tarfile
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

GENERATOR_VERSION = 3
DEFAULT_MAX_BYTES = 250 * 1024 * 1024
MAX_EXPORTED_ALUMNI = 30
MAX_EXPORTED_PHOTOS = 30
REPO_ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = REPO_ROOT / "scripts" / "initial.sql"
PHOTO_HELPER = REPO_ROOT / "scripts" / "sanitize_cloud_photos.mjs"
FIXTURE_ROOT = REPO_ROOT / "fixtures" / "cloud"
FIXTURE_DATA = FIXTURE_ROOT / "seed.json"
FIXTURE_PHOTOS = FIXTURE_ROOT / "Fotos"

ALUMNI_COLUMNS = (
    "ID",
    "Nome",
    "Excluido",
    "Curso",
    "AnoInicio",
    "AnoTermino",
    "Email",
    "OcultarEmail",
    "EmailAlternativo",
    "ICQ",
    "Apelidos",
    "Endereco",
    "Cidade",
    "Estado",
    "CEP",
    "Pais",
    "Telefone",
    "HomePage",
    "Instagram",
    "Facebook",
    "LinkedIn",
    "WhatsApp",
    "DadoPubl",
    "ComoEncontrou",
    "ComoEncontrouExtra",
    "Comentarios",
    "DtCadastro",
    "DtAtualizacao",
    "CPF",
    "Prontuario",
    "lixo_homepage",
    "Listserv",
    "Browser",
    "RemoteUserIP",
    "PublicaTelefone",
    "Operacao",
    "InscricaoInicialML",
    "Aux",
    "NaoVerificaDuplicidade",
    "lixo",
)

PHOTO_COLUMNS = (
    "idFoto",
    "NomeArqOriginal",
    "NomeArqStored",
    "NomeMiniaturaStored",
    "CursoFoto",
    "AnoFoto",
    "TituloFoto",
    "AnoFormatura",
    "Carometro",
    "TurmaFoto",
    "idExAlunoUpload",
    "FotoPessoal",
    "EmailFoto",
    "DtUploadFoto",
    "TamanhoFoto",
    "ContentType",
    "OrigLargura",
    "OrigAltura",
    "Excluido",
)

PRIVATE_ALUMNI_COLUMNS = (
    "EmailAlternativo",
    "Endereco",
    "Cidade",
    "Estado",
    "CEP",
    "Pais",
    "ComoEncontrou",
    "ComoEncontrouExtra",
    "DtAtualizacao",
    "CPF",
    "Prontuario",
    "lixo_homepage",
    "Listserv",
    "Browser",
    "RemoteUserIP",
    "Operacao",
    "Aux",
    "lixo",
)

SELECT_ALUMNI_IDS_SQL = """
WITH ranked AS (
  SELECT
    e.ID,
    COALESCE(e.Curso, '') AS Curso,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(e.Curso, '')
      ORDER BY
        CASE WHEN EXISTS (
          SELECT 1
          FROM Fotos AS f
          WHERE f.idExAlunoUpload = e.ID AND f.Excluido = 0
        ) THEN 0 ELSE 1 END,
        e.ID
    ) AS course_rank
  FROM ExAlunos AS e
  WHERE e.Excluido = 0
)
SELECT ID
FROM ranked
ORDER BY course_rank, Curso, ID
LIMIT ?
"""

EXPORT_ALUMNI_SQL = """
SELECT
  ID,
  Nome,
  0 AS Excluido,
  Curso,
  AnoInicio,
  AnoTermino,
  CASE WHEN OcultarEmail = 0 THEN NULLIF(TRIM(Email), '') END AS Email,
  OcultarEmail,
  NULL AS EmailAlternativo,
  ICQ,
  Apelidos,
  NULL AS Endereco,
  NULL AS Cidade,
  NULL AS Estado,
  NULL AS CEP,
  NULL AS Pais,
  CASE
    WHEN PublicaTelefone = 1 THEN NULLIF(TRIM(Telefone), '')
  END AS Telefone,
  HomePage,
  Instagram,
  Facebook,
  LinkedIn,
  WhatsApp,
  DadoPubl,
  NULL AS ComoEncontrou,
  NULL AS ComoEncontrouExtra,
  Comentarios,
  DtCadastro,
  NULL AS DtAtualizacao,
  NULL AS CPF,
  NULL AS Prontuario,
  NULL AS lixo_homepage,
  NULL AS Listserv,
  NULL AS Browser,
  NULL AS RemoteUserIP,
  PublicaTelefone,
  NULL AS Operacao,
  0 AS InscricaoInicialML,
  NULL AS Aux,
  0 AS NaoVerificaDuplicidade,
  NULL AS lixo
FROM ExAlunos
WHERE Excluido = 0
  AND ID IN ({alumni_ids})
ORDER BY ID
"""

EXPORT_PHOTO_SQL = """
SELECT
  f.idFoto,
  f.CursoFoto,
  f.AnoFoto,
  f.TituloFoto,
  f.AnoFormatura,
  f.Carometro,
  f.TurmaFoto,
  f.idExAlunoUpload,
  f.FotoPessoal,
  f.DtUploadFoto,
  f.NomeArqStored
FROM Fotos AS f
JOIN ExAlunos AS e ON e.ID = f.idExAlunoUpload
WHERE f.Excluido = 0
  AND e.Excluido = 0
  AND f.idExAlunoUpload IN ({alumni_ids})
ORDER BY f.idFoto
LIMIT ?
"""


class CloudDataError(RuntimeError):
    """A safe error that can be shown without exposing source paths or data."""


def resolve_path(value: str) -> Path:
    return Path(value).expanduser().resolve()


def sha256_file(filename: Path) -> str:
    digest = hashlib.sha256()
    with filename.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def tree_fingerprint(directory: Path) -> str:
    digest = hashlib.sha256()
    for filename in sorted(directory.rglob("*")):
        if filename.is_symlink():
            raise CloudDataError("O diretório de fotos contém um link simbólico.")
        if not filename.is_file():
            continue
        relative = filename.relative_to(directory).as_posix().encode()
        digest.update(len(relative).to_bytes(8, "big"))
        digest.update(relative)
        digest.update(bytes.fromhex(sha256_file(filename)))
    return digest.hexdigest()


def package_photo_digest(directory: Path) -> tuple[str, int, int]:
    digest = hashlib.sha256()
    count = 0
    size = 0
    for filename in sorted(path for path in directory.iterdir() if path.is_file()):
        relative = filename.name.encode()
        file_size = filename.stat().st_size
        digest.update(len(relative).to_bytes(8, "big"))
        digest.update(relative)
        digest.update(bytes.fromhex(sha256_file(filename)))
        count += 1
        size += file_size
    return digest.hexdigest(), count, size


def is_within(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def validate_source_and_output(source_db: Path, source_photos: Path, output: Path) -> None:
    if not source_db.is_file():
        raise CloudDataError("O banco de origem não existe ou não é um arquivo.")
    if not source_photos.is_dir():
        raise CloudDataError("O diretório de fotos de origem não existe.")
    if output.exists():
        raise CloudDataError("O destino já existe; escolha outro caminho ou remova-o manualmente.")
    if output == source_db or is_within(source_db, output):
        raise CloudDataError("O destino não pode conter o banco de origem.")
    if output == source_photos or is_within(output, source_photos):
        raise CloudDataError("O destino não pode estar dentro das fotos de origem.")
    if is_within(source_photos, output):
        raise CloudDataError("O destino não pode conter as fotos de origem.")
    output.parent.mkdir(parents=True, exist_ok=True)


def open_source_database(filename: Path) -> sqlite3.Connection:
    uri = f"{filename.as_uri()}?mode=ro"
    connection = sqlite3.connect(uri, uri=True)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA query_only = ON")
    return connection


def table_columns(connection: sqlite3.Connection, table: str) -> tuple[str, ...]:
    return tuple(row["name"] for row in connection.execute(f"PRAGMA table_info({table})"))


def require_source_schema(connection: sqlite3.Connection) -> None:
    for table, expected in (("ExAlunos", ALUMNI_COLUMNS), ("Fotos", PHOTO_COLUMNS)):
        existing = set(table_columns(connection, table))
        missing = set(expected) - existing
        if missing:
            raise CloudDataError(
                f"O schema de origem não possui todas as colunas exigidas em {table}."
            )


def create_target_database(filename: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(filename)
    connection.row_factory = sqlite3.Row
    connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("UPDATE SchemaMigrations SET AppliedAt = 0")
    connection.commit()
    return connection


def insert_rows(
    connection: sqlite3.Connection,
    table: str,
    columns: Iterable[str],
    rows: Iterable[Iterable[Any]],
) -> None:
    column_list = tuple(columns)
    placeholders = ",".join("?" for _ in column_list)
    names = ",".join(column_list)
    connection.executemany(
        f"INSERT INTO {table} ({names}) VALUES ({placeholders})",
        rows,
    )


def safe_source_photo_name(value: Any) -> str:
    if not isinstance(value, str) or not value or value in {".", ".."}:
        raise CloudDataError("Uma foto possui nome de arquivo inválido.")
    if Path(value).name != value or "/" in value or "\\" in value:
        raise CloudDataError("Uma foto possui caminho inseguro.")
    return value


def run_photo_helper(source: Path, destination: Path, tasks: list[dict[str, Any]]) -> dict[int, dict[str, int]]:
    task_file = destination.parent / ".photo-tasks.json"
    result_file = destination.parent / ".photo-results.json"
    task_file.write_text(json.dumps(tasks, ensure_ascii=False), encoding="utf-8")
    try:
        process = subprocess.run(
            [
                "node",
                str(PHOTO_HELPER),
                str(source),
                str(destination),
                str(task_file),
                str(result_file),
            ],
            cwd=REPO_ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        if process.returncode != 0:
            message = process.stderr.strip() or "falha não detalhada"
            raise CloudDataError(f"Não foi possível sanitizar as fotos: {message}")
        raw = json.loads(result_file.read_text(encoding="utf-8"))
        return {int(item["id"]): item for item in raw}
    finally:
        task_file.unlink(missing_ok=True)
        result_file.unlink(missing_ok=True)


def photo_insert_row(row: sqlite3.Row, metrics: dict[str, int]) -> tuple[Any, ...]:
    photo_id = int(row["idFoto"])
    stored = f"photo-{photo_id}.webp"
    thumbnail = f"photo-{photo_id}-mini.webp"
    return (
        photo_id,
        stored,
        stored,
        thumbnail,
        row["CursoFoto"],
        row["AnoFoto"],
        row["TituloFoto"],
        row["AnoFormatura"],
        row["Carometro"],
        row["TurmaFoto"],
        row["idExAlunoUpload"],
        row["FotoPessoal"],
        None,
        row["DtUploadFoto"],
        metrics["size"],
        "image/webp",
        metrics["width"],
        metrics["height"],
        0,
    )


def source_fingerprint(source_db: Path, source_photos: Path) -> tuple[str, str, str]:
    wal = source_db.with_name(f"{source_db.name}-wal")
    wal_fingerprint = sha256_file(wal) if wal.is_file() else "absent"
    return sha256_file(source_db), wal_fingerprint, tree_fingerprint(source_photos)


def build_manifest(data_dir: Path, mode: str) -> dict[str, Any]:
    database = data_dir / "db.sqlite3"
    photos = data_dir / "Fotos"
    photo_digest, photo_count, photo_bytes = package_photo_digest(photos)
    with sqlite3.connect(database) as connection:
        alumni_count = connection.execute("SELECT COUNT(*) FROM ExAlunos").fetchone()[0]
        photo_rows = connection.execute("SELECT COUNT(*) FROM Fotos").fetchone()[0]
    return {
        "format_version": 1,
        "generator_version": GENERATOR_VERSION,
        "mode": mode,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "schema_sha256": sha256_file(SCHEMA_PATH),
        "database": {
            "rows": {
                "ExAlunos": alumni_count,
                "Fotos": photo_rows,
            },
            "bytes": database.stat().st_size,
            "sha256": sha256_file(database),
        },
        "photos": {
            "files": photo_count,
            "bytes": photo_bytes,
            "sha256": photo_digest,
        },
    }


def write_manifest(data_dir: Path, mode: str) -> None:
    manifest = build_manifest(data_dir, mode)
    (data_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def export_data(source_db: Path, source_photos: Path, output: Path) -> None:
    validate_source_and_output(source_db, source_photos, output)
    before = source_fingerprint(source_db, source_photos)
    temporary = Path(tempfile.mkdtemp(prefix=f".{output.name}.tmp-", dir=output.parent))
    try:
        photos_output = temporary / "Fotos"
        photos_output.mkdir()
        target = create_target_database(temporary / "db.sqlite3")
        source = open_source_database(source_db)
        try:
            require_source_schema(source)
            selected_ids = [
                int(row["ID"])
                for row in source.execute(
                    SELECT_ALUMNI_IDS_SQL,
                    (MAX_EXPORTED_ALUMNI,),
                ).fetchall()
            ]
            if not selected_ids:
                raise CloudDataError("A origem não contém ex-alunos públicos.")

            placeholders = ",".join("?" for _ in selected_ids)
            alumni = source.execute(
                EXPORT_ALUMNI_SQL.format(alumni_ids=placeholders),
                selected_ids,
            ).fetchall()
            insert_rows(
                target,
                "ExAlunos",
                ALUMNI_COLUMNS,
                (tuple(row[column] for column in ALUMNI_COLUMNS) for row in alumni),
            )

            photos = source.execute(
                EXPORT_PHOTO_SQL.format(alumni_ids=placeholders),
                (*selected_ids, MAX_EXPORTED_PHOTOS),
            ).fetchall()
            tasks = []
            for row in photos:
                photo_id = int(row["idFoto"])
                tasks.append(
                    {
                        "id": photo_id,
                        "source": safe_source_photo_name(row["NomeArqStored"]),
                        "stored": f"photo-{photo_id}.webp",
                        "thumbnail": f"photo-{photo_id}-mini.webp",
                    }
                )
            metrics = run_photo_helper(source_photos, photos_output, tasks)
            if set(metrics) != {int(row["idFoto"]) for row in photos}:
                raise CloudDataError("O processamento de fotos retornou um conjunto incompleto.")

            insert_rows(
                target,
                "Fotos",
                PHOTO_COLUMNS,
                (
                    photo_insert_row(row, metrics[int(row["idFoto"])])
                    for row in photos
                ),
            )
            target.commit()
        finally:
            source.close()
            target.close()

        write_manifest(temporary, "sanitized-export")
        validate_package(temporary, DEFAULT_MAX_BYTES)
        after = source_fingerprint(source_db, source_photos)
        if before != after:
            raise CloudDataError("Uma fonte local mudou durante a exportação.")
        temporary.replace(output)
    except Exception:
        shutil.rmtree(temporary)
        raise


def sample_alumni() -> list[tuple[Any, ...]]:
    base = {
        column: None
        for column in ALUMNI_COLUMNS
    }
    records = [
        {
            "ID": 1,
            "Nome": "Pessoa Fictícia da Silva",
            "Curso": "MEC",
            "AnoInicio": 1988,
            "AnoTermino": 1991,
            "Email": "pessoa01@example.invalid",
            "OcultarEmail": 0,
            "Apelidos": "Oficina",
            "Telefone": "+55 11 00000-0001",
            "PublicaTelefone": 1,
            "DadoPubl": "Registro inteiramente fictício para testes.",
            "DtCadastro": 1704067200000,
        },
        {
            "ID": 2,
            "Nome": "Ex-Aluna Fictícia de Souza",
            "Curso": "ELO",
            "AnoInicio": 1995,
            "AnoTermino": 1998,
            "Email": None,
            "OcultarEmail": 1,
            "Apelidos": "Circuito",
            "WhatsApp": "+551100000002",
            "PublicaTelefone": 0,
            "DadoPubl": "Perfil de demonstração sem dados reais.",
            "DtCadastro": 1704153600000,
        },
        {
            "ID": 3,
            "Nome": "Cadastro Fictício de Oliveira",
            "Curso": "PRD",
            "AnoInicio": 2001,
            "AnoTermino": 2004,
            "OcultarEmail": 0,
            "HomePage": "https://example.invalid/perfil-03",
            "PublicaTelefone": 0,
            "Comentarios": "Conteúdo sintético.",
            "DtCadastro": 1704240000000,
        },
    ]
    output = []
    for record in records:
        values = dict(base)
        values.update(
            {
                "Excluido": 0,
                "OcultarEmail": 0,
                "PublicaTelefone": 0,
                "InscricaoInicialML": 0,
                "NaoVerificaDuplicidade": 0,
            }
        )
        values.update(record)
        output.append(tuple(values[column] for column in ALUMNI_COLUMNS))
    return output


def fixture_rows(
    payload: dict[str, Any],
    table: str,
    columns: tuple[str, ...],
) -> list[tuple[Any, ...]]:
    records = payload.get(table)
    if not isinstance(records, list):
        raise CloudDataError(f"A fixture não contém uma lista válida para {table}.")
    if table == "ExAlunos" and len(records) > MAX_EXPORTED_ALUMNI:
        raise CloudDataError("A fixture excede o limite de ex-alunos.")
    if table == "Fotos" and len(records) > MAX_EXPORTED_PHOTOS:
        raise CloudDataError("A fixture excede o limite de fotos.")

    expected_columns = set(columns)
    rows = []
    for record in records:
        if not isinstance(record, dict) or set(record) != expected_columns:
            raise CloudDataError(f"Um registro da fixture de {table} é inválido.")
        rows.append(tuple(record[column] for column in columns))
    return rows


def create_from_fixture(output: Path) -> None:
    output = output.resolve()
    if output.exists():
        raise CloudDataError("O destino já existe; remova-o manualmente antes de inicializar.")
    if not FIXTURE_DATA.is_file() or not FIXTURE_PHOTOS.is_dir():
        raise CloudDataError("A fixture versionada está ausente ou incompleta.")

    payload = json.loads(FIXTURE_DATA.read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or set(payload) != {
        "format_version",
        "data_classification",
        "photo_classification",
        "ExAlunos",
        "Fotos",
    }:
        raise CloudDataError("A fixture contém campos inesperados ou incompletos.")
    if payload["format_version"] != 1:
        raise CloudDataError("A versão da fixture não é suportada.")
    if payload["data_classification"] != "synthetic":
        raise CloudDataError("A fixture deve conter somente perfis sintéticos.")
    if payload["photo_classification"] != "institutional-placeholders":
        raise CloudDataError("A fixture deve conter somente imagens genéricas.")

    alumni = fixture_rows(payload, "ExAlunos", ALUMNI_COLUMNS)
    photos = fixture_rows(payload, "Fotos", PHOTO_COLUMNS)
    for record in payload["ExAlunos"]:
        email = record["Email"]
        if not str(record["Nome"]).startswith("Ex-aluno fictício "):
            raise CloudDataError("A fixture contém um nome não sintético.")
        if email is not None and not str(email).endswith("@example.invalid"):
            raise CloudDataError("A fixture contém um e-mail não sintético.")
        if any(
            record[column] is not None
            for column in (
                "ICQ",
                "Telefone",
                "HomePage",
                "Instagram",
                "Facebook",
                "LinkedIn",
                "WhatsApp",
            )
        ):
            raise CloudDataError("A fixture contém contato ou perfil externo.")
    expected_files: set[str] = set()
    for row in payload["Fotos"]:
        expected_files.add(safe_source_photo_name(row["NomeArqStored"]))
        expected_files.add(safe_source_photo_name(row["NomeMiniaturaStored"]))
    actual_files = {
        path.name
        for path in FIXTURE_PHOTOS.iterdir()
        if path.is_file() and not path.is_symlink()
    }
    if actual_files != expected_files:
        raise CloudDataError("As fotos da fixture estão ausentes ou possuem arquivos órfãos.")

    before = (sha256_file(FIXTURE_DATA), tree_fingerprint(FIXTURE_PHOTOS))
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = Path(tempfile.mkdtemp(prefix=f".{output.name}.tmp-", dir=output.parent))
    try:
        photos_output = temporary / "Fotos"
        photos_output.mkdir()
        target = create_target_database(temporary / "db.sqlite3")
        try:
            insert_rows(target, "ExAlunos", ALUMNI_COLUMNS, alumni)
            insert_rows(target, "Fotos", PHOTO_COLUMNS, photos)
            target.commit()
        finally:
            target.close()

        for filename in sorted(expected_files):
            shutil.copyfile(FIXTURE_PHOTOS / filename, photos_output / filename)

        write_manifest(temporary, "versioned-fixture")
        validate_package(temporary, DEFAULT_MAX_BYTES)
        after = (sha256_file(FIXTURE_DATA), tree_fingerprint(FIXTURE_PHOTOS))
        if before != after:
            raise CloudDataError("A fixture mudou durante a inicialização.")
        temporary.replace(output)
    except Exception:
        shutil.rmtree(temporary)
        raise


def create_sample(output: Path) -> None:
    output = output.resolve()
    if output.exists():
        raise CloudDataError("O destino já existe; remova-o manualmente antes de gerar a amostra.")
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = Path(tempfile.mkdtemp(prefix=f".{output.name}.tmp-", dir=output.parent))
    try:
        photos_output = temporary / "Fotos"
        photos_output.mkdir()
        target = create_target_database(temporary / "db.sqlite3")
        try:
            insert_rows(target, "ExAlunos", ALUMNI_COLUMNS, sample_alumni())
            photo_sources = ["ETFSP.GIF", "ifsp.png"]
            tasks = [
                {
                    "id": index,
                    "source": source,
                    "stored": f"photo-{index}.webp",
                    "thumbnail": f"photo-{index}-mini.webp",
                }
                for index, source in enumerate(photo_sources, start=1)
            ]
            metrics = run_photo_helper(REPO_ROOT / "static" / "images", photos_output, tasks)
            rows = []
            for index in range(1, len(tasks) + 1):
                fake = {
                    "idFoto": index,
                    "CursoFoto": ("MEC", "ELO")[index - 1],
                    "AnoFoto": (1989, 1996)[index - 1],
                    "TituloFoto": f"Foto fictícia {index}",
                    "AnoFormatura": (1991, 1998)[index - 1],
                    "Carometro": 1 if index == 1 else 0,
                    "TurmaFoto": f"T{index}",
                    "idExAlunoUpload": index,
                    "FotoPessoal": 1 if index == 1 else 0,
                    "DtUploadFoto": 1704067200000 + index,
                }
                rows.append(photo_insert_row(fake, metrics[index]))
            insert_rows(target, "Fotos", PHOTO_COLUMNS, rows)
            target.commit()
        finally:
            target.close()
        write_manifest(temporary, "synthetic-sample")
        validate_package(temporary, DEFAULT_MAX_BYTES)
        temporary.replace(output)
    except Exception:
        shutil.rmtree(temporary)
        raise


def validate_package(data_dir: Path, max_bytes: int) -> dict[str, Any]:
    data_dir = data_dir.resolve()
    database = data_dir / "db.sqlite3"
    photos = data_dir / "Fotos"
    manifest_file = data_dir / "manifest.json"
    if not database.is_file() or not photos.is_dir() or not manifest_file.is_file():
        raise CloudDataError("O pacote não contém banco, fotos e manifesto.")

    total_bytes = sum(path.stat().st_size for path in data_dir.rglob("*") if path.is_file())
    if total_bytes > max_bytes:
        raise CloudDataError("O pacote excede o limite de tamanho configurado.")

    manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
    if set(manifest) != {
        "format_version",
        "generator_version",
        "mode",
        "generated_at",
        "schema_sha256",
        "database",
        "photos",
    }:
        raise CloudDataError("O manifesto contém campos inesperados ou incompletos.")
    if manifest["schema_sha256"] != sha256_file(SCHEMA_PATH):
        raise CloudDataError("O schema do pacote não corresponde ao schema versionado.")

    photo_digest, photo_count, photo_bytes = package_photo_digest(photos)
    expected_database = manifest["database"]
    expected_photos = manifest["photos"]
    if expected_database["sha256"] != sha256_file(database):
        raise CloudDataError("O checksum do banco não corresponde ao manifesto.")
    if expected_database["bytes"] != database.stat().st_size:
        raise CloudDataError("O tamanho do banco não corresponde ao manifesto.")
    if expected_photos != {
        "files": photo_count,
        "bytes": photo_bytes,
        "sha256": photo_digest,
    }:
        raise CloudDataError("O conjunto de fotos não corresponde ao manifesto.")

    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row
    try:
        integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
        if integrity != "ok":
            raise CloudDataError("A verificação de integridade do SQLite falhou.")
        if connection.execute("PRAGMA foreign_key_check").fetchone() is not None:
            raise CloudDataError("O banco possui referência estrangeira inválida.")
        connection.execute("SELECT ID, Nome, QtdFotos FROM qryExAlunos LIMIT 1").fetchall()

        alumni_count = connection.execute("SELECT COUNT(*) FROM ExAlunos").fetchone()[0]
        photo_rows_count = connection.execute("SELECT COUNT(*) FROM Fotos").fetchone()[0]
        if alumni_count > MAX_EXPORTED_ALUMNI:
            raise CloudDataError("O pacote excede o limite de ex-alunos.")
        if photo_rows_count > MAX_EXPORTED_PHOTOS:
            raise CloudDataError("O pacote excede o limite de fotos.")

        private_predicate = " OR ".join(
            f"{column} IS NOT NULL" for column in PRIVATE_ALUMNI_COLUMNS
        )
        if connection.execute(
            f"SELECT 1 FROM ExAlunos WHERE {private_predicate} LIMIT 1"
        ).fetchone():
            raise CloudDataError("Uma coluna privada de ex-aluno contém dados.")
        if connection.execute(
            "SELECT 1 FROM ExAlunos WHERE OcultarEmail = 1 AND Email IS NOT NULL LIMIT 1"
        ).fetchone():
            raise CloudDataError("Um e-mail oculto foi incluído.")
        if connection.execute(
            "SELECT 1 FROM ExAlunos WHERE PublicaTelefone = 0 AND Telefone IS NOT NULL LIMIT 1"
        ).fetchone():
            raise CloudDataError("Um telefone não público foi incluído.")
        if connection.execute(
            "SELECT 1 FROM ExAlunos WHERE Excluido != 0 LIMIT 1"
        ).fetchone():
            raise CloudDataError("Um ex-aluno excluído foi incluído.")
        if connection.execute(
            "SELECT 1 FROM Fotos WHERE Excluido != 0 OR EmailFoto IS NOT NULL LIMIT 1"
        ).fetchone():
            raise CloudDataError("Uma foto excluída ou com e-mail foi incluída.")

        photo_rows = connection.execute(
            "SELECT idFoto, NomeArqOriginal, NomeArqStored, NomeMiniaturaStored FROM Fotos"
        ).fetchall()
        expected_files: set[str] = set()
        for row in photo_rows:
            photo_id = int(row["idFoto"])
            stored = f"photo-{photo_id}.webp"
            thumbnail = f"photo-{photo_id}-mini.webp"
            if (
                row["NomeArqOriginal"] != stored
                or row["NomeArqStored"] != stored
                or row["NomeMiniaturaStored"] != thumbnail
            ):
                raise CloudDataError("Uma foto não usa nomes controlados pelo exportador.")
            expected_files.update((stored, thumbnail))

        actual_files = {path.name for path in photos.iterdir() if path.is_file()}
        if actual_files != expected_files:
            raise CloudDataError("Há foto ausente ou órfã no pacote.")
        if manifest["database"]["rows"] != {
            "ExAlunos": connection.execute("SELECT COUNT(*) FROM ExAlunos").fetchone()[0],
            "Fotos": len(photo_rows),
        }:
            raise CloudDataError("As contagens do banco não correspondem ao manifesto.")
    finally:
        connection.close()
    return manifest


def pack_data(data_dir: Path, archive: Path, max_bytes: int) -> None:
    data_dir = data_dir.resolve()
    archive = archive.resolve()
    validate_package(data_dir, max_bytes)
    if archive.exists():
        raise CloudDataError("O arquivo de transporte já existe.")
    if is_within(archive, data_dir):
        raise CloudDataError("O arquivo de transporte deve ficar fora do pacote.")
    archive.parent.mkdir(parents=True, exist_ok=True)
    temporary_fd, temporary_name = tempfile.mkstemp(
        prefix=f".{archive.name}.tmp-", dir=archive.parent
    )
    os.close(temporary_fd)
    temporary = Path(temporary_name)
    try:
        with tarfile.open(temporary, "w:gz") as bundle:
            bundle.add(data_dir, arcname=".cloud-data", recursive=True)
        temporary.replace(archive)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)

    export_parser = commands.add_parser("export", help="exporta dados locais sanitizados")
    export_parser.add_argument("--source-db", required=True)
    export_parser.add_argument("--source-photos", required=True)
    export_parser.add_argument("--output", default=".cloud-data")

    sample_parser = commands.add_parser("sample", help="gera dados inteiramente fictícios")
    init_parser = commands.add_parser(
        "init",
        help="cria os dados Cloud do zero a partir da fixture versionada",
    )
    init_parser.add_argument("--output", default=".cloud-data")

    sample_parser.add_argument("--output", default=".cloud-data")

    check_parser = commands.add_parser("check", help="valida um pacote existente")
    check_parser.add_argument("--data-dir", default=".cloud-data")
    check_parser.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES)

    pack_parser = commands.add_parser("pack", help="cria um arquivo de transporte validado")
    pack_parser.add_argument("--data-dir", default=".cloud-data")
    pack_parser.add_argument("--output", default=".cloud-data.tar.gz")
    pack_parser.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES)

    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.command == "export":
            export_data(
                resolve_path(args.source_db),
                resolve_path(args.source_photos),
                resolve_path(args.output),
            )
            print("Pacote sanitizado criado e validado.")
        elif args.command == "init":
            create_from_fixture(resolve_path(args.output))
            print("Banco Cloud criado do zero e validado.")
        elif args.command == "sample":
            create_sample(resolve_path(args.output))
            print("Amostra fictícia criada e validada.")
        elif args.command == "check":
            manifest = validate_package(resolve_path(args.data_dir), args.max_bytes)
            print(
                "Pacote válido: "
                f"{manifest['database']['rows']['ExAlunos']} ex-alunos, "
                f"{manifest['database']['rows']['Fotos']} fotos."
            )
        elif args.command == "pack":
            pack_data(
                resolve_path(args.data_dir),
                resolve_path(args.output),
                args.max_bytes,
            )
            print("Arquivo de transporte criado.")
        return 0
    except (CloudDataError, OSError, sqlite3.Error, json.JSONDecodeError) as error:
        print(f"Erro: {error}", file=os.sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
