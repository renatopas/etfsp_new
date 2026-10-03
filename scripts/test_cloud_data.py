#!/usr/bin/env python3
"""Integration tests for the Codex Cloud data builder."""

from __future__ import annotations

import json
import shutil
import sqlite3
import tempfile
import unittest
from pathlib import Path

import cloud_data


class CloudDataTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory(prefix="etfsp-cloud-data-test-")
        self.root = Path(self.temporary.name)
        self.source_db = self.root / "source.sqlite3"
        self.source_photos = self.root / "source-photos"
        self.source_photos.mkdir()

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def create_source(self) -> None:
        connection = sqlite3.connect(self.source_db)
        connection.executescript(cloud_data.SCHEMA_PATH.read_text(encoding="utf-8"))
        connection.executemany(
            """
            INSERT INTO ExAlunos (
              ID, Nome, Excluido, Curso, AnoInicio, AnoTermino, Email,
              OcultarEmail, EmailAlternativo, Apelidos, Endereco, Cidade,
              Estado, CEP, Pais, Telefone, WhatsApp, DadoPubl, ComoEncontrou,
              ComoEncontrouExtra, Comentarios, DtCadastro, DtAtualizacao, CPF,
              Prontuario, Listserv, Browser, RemoteUserIP, PublicaTelefone,
              Operacao, InscricaoInicialML, Aux, NaoVerificaDuplicidade, lixo
            ) VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            """,
            [
                (
                    1,
                    "Pessoa Pública Fictícia",
                    0,
                    "MEC",
                    1980,
                    1983,
                    "publica@example.invalid",
                    0,
                    "alternativo@example.invalid",
                    "Pública",
                    "Rua Privada",
                    "Cidade Privada",
                    "SP",
                    "00000-000",
                    "Brasil",
                    "+55 11 00000-0001",
                    "+551100000001",
                    "Texto público",
                    "Busca privada",
                    "Detalhe privado",
                    "Comentário público",
                    1704067200000,
                    1704067200001,
                    "00000000000",
                    "PRIVADO",
                    1,
                    "Navegador privado",
                    "192.0.2.1",
                    1,
                    "Operação privada",
                    1,
                    "Auxiliar privado",
                    1,
                    "Lixo privado",
                ),
                (
                    2,
                    "Pessoa Oculta Fictícia",
                    0,
                    "ELO",
                    1990,
                    1993,
                    "oculto@example.invalid",
                    1,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    "+55 11 00000-0002",
                    None,
                    None,
                    None,
                    None,
                    None,
                    1704067200002,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    0,
                    None,
                    0,
                    None,
                    0,
                    None,
                ),
                (
                    3,
                    "Pessoa Excluída Fictícia",
                    1,
                    "PRD",
                    2000,
                    2003,
                    "excluida@example.invalid",
                    0,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    1704067200003,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    0,
                    None,
                    0,
                    None,
                    0,
                    None,
                ),
            ],
        )
        connection.executemany(
            """
            INSERT INTO Fotos (
              idFoto, NomeArqOriginal, NomeArqStored, NomeMiniaturaStored,
              CursoFoto, AnoFoto, TituloFoto, AnoFormatura, Carometro,
              TurmaFoto, idExAlunoUpload, FotoPessoal, EmailFoto,
              DtUploadFoto, TamanhoFoto, ContentType, OrigLargura,
              OrigAltura, Excluido
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    10,
                    "nome-privado.png",
                    "active.png",
                    "active-mini.png",
                    "MEC",
                    1981,
                    "Foto pública fictícia",
                    1983,
                    0,
                    "T1",
                    1,
                    1,
                    "foto@example.invalid",
                    1704067200010,
                    100,
                    "image/png",
                    10,
                    10,
                    0,
                ),
                (
                    11,
                    "excluida.png",
                    "excluded.png",
                    "excluded-mini.png",
                    "PRD",
                    2001,
                    "Foto excluída",
                    2003,
                    0,
                    "T2",
                    3,
                    0,
                    None,
                    1704067200011,
                    100,
                    "image/png",
                    10,
                    10,
                    0,
                ),
            ],
        )
        connection.commit()
        connection.close()
        source_image = cloud_data.REPO_ROOT / "static" / "images" / "ifsp.png"
        for name in ("active.png", "active-mini.png", "excluded.png", "excluded-mini.png"):
            shutil.copyfile(source_image, self.source_photos / name)

    def test_sample_package_is_valid(self) -> None:
        output = self.root / "sample"
        cloud_data.create_sample(output)
        manifest = cloud_data.validate_package(
            output,
            cloud_data.DEFAULT_MAX_BYTES,
        )
        self.assertEqual(manifest["mode"], "synthetic-sample")
        self.assertEqual(manifest["database"]["rows"], {"ExAlunos": 3, "Fotos": 2})

    def test_versioned_fixture_creates_database_without_local_sources(self) -> None:
        output = self.root / "fixture"
        self.assertFalse(self.source_db.exists())

        cloud_data.create_from_fixture(output)
        manifest = cloud_data.validate_package(
            output,
            cloud_data.DEFAULT_MAX_BYTES,
        )

        self.assertFalse(self.source_db.exists())
        self.assertEqual(manifest["mode"], "versioned-fixture")
        self.assertEqual(
            manifest["database"]["rows"],
            {
                "ExAlunos": cloud_data.MAX_EXPORTED_ALUMNI,
                "Fotos": 2,
            },
        )

    def test_fixture_rejects_a_non_synthetic_name(self) -> None:
        fixture = self.root / "invalid-fixture"
        shutil.copytree(cloud_data.FIXTURE_ROOT, fixture)
        fixture_data = fixture / "seed.json"
        payload = json.loads(fixture_data.read_text(encoding="utf-8"))
        payload["ExAlunos"][0]["Nome"] = "Nome de pessoa real"
        fixture_data.write_text(
            json.dumps(payload, ensure_ascii=False),
            encoding="utf-8",
        )

        original_data = cloud_data.FIXTURE_DATA
        original_photos = cloud_data.FIXTURE_PHOTOS
        try:
            cloud_data.FIXTURE_DATA = fixture_data
            cloud_data.FIXTURE_PHOTOS = fixture / "Fotos"
            with self.assertRaises(cloud_data.CloudDataError):
                cloud_data.create_from_fixture(self.root / "rejected-fixture")
        finally:
            cloud_data.FIXTURE_DATA = original_data
            cloud_data.FIXTURE_PHOTOS = original_photos

    def test_export_removes_private_and_excluded_data(self) -> None:
        self.create_source()
        output = self.root / "export"
        source_before = cloud_data.source_fingerprint(
            self.source_db,
            self.source_photos,
        )

        cloud_data.export_data(self.source_db, self.source_photos, output)

        self.assertEqual(
            source_before,
            cloud_data.source_fingerprint(self.source_db, self.source_photos),
        )
        manifest = cloud_data.validate_package(
            output,
            cloud_data.DEFAULT_MAX_BYTES,
        )
        self.assertEqual(manifest["mode"], "sanitized-export")
        self.assertEqual(manifest["database"]["rows"], {"ExAlunos": 2, "Fotos": 1})

        connection = sqlite3.connect(output / "db.sqlite3")
        connection.row_factory = sqlite3.Row
        public = connection.execute(
            "SELECT * FROM ExAlunos WHERE ID = 1"
        ).fetchone()
        hidden = connection.execute(
            "SELECT * FROM ExAlunos WHERE ID = 2"
        ).fetchone()
        photo = connection.execute("SELECT * FROM Fotos").fetchone()
        connection.close()

        self.assertEqual(public["Email"], "publica@example.invalid")
        self.assertEqual(public["Telefone"], "+55 11 00000-0001")
        self.assertIsNone(public["Endereco"])
        self.assertIsNone(public["CPF"])
        self.assertIsNone(public["RemoteUserIP"])
        self.assertIsNone(hidden["Email"])
        self.assertIsNone(hidden["Telefone"])
        self.assertEqual(photo["NomeArqStored"], "photo-10.webp")
        self.assertEqual(photo["NomeMiniaturaStored"], "photo-10-mini.webp")
        self.assertIsNone(photo["EmailFoto"])
        self.assertFalse((output / "Fotos" / "photo-11.webp").exists())

        with self.assertRaises(cloud_data.CloudDataError):
            cloud_data.export_data(self.source_db, self.source_photos, output)

    def test_export_limits_alumni_and_keeps_course_variety(self) -> None:
        connection = sqlite3.connect(self.source_db)
        connection.executescript(
            cloud_data.SCHEMA_PATH.read_text(encoding="utf-8")
        )
        courses = ("ELO", "MEC", "PRD")
        connection.executemany(
            "INSERT INTO ExAlunos (ID, Nome, Curso) VALUES (?, ?, ?)",
            [
                (
                    student_id,
                    f"Pessoa Fictícia {student_id:02d}",
                    courses[(student_id - 1) % len(courses)],
                )
                for student_id in range(1, 36)
            ],
        )
        connection.commit()
        connection.close()

        output = self.root / "limited-export"
        cloud_data.export_data(self.source_db, self.source_photos, output)
        manifest = cloud_data.validate_package(
            output,
            cloud_data.DEFAULT_MAX_BYTES,
        )

        self.assertEqual(
            manifest["database"]["rows"],
            {"ExAlunos": cloud_data.MAX_EXPORTED_ALUMNI, "Fotos": 0},
        )
        connection = sqlite3.connect(output / "db.sqlite3")
        exported_courses = {
            row[0]
            for row in connection.execute("SELECT DISTINCT Curso FROM ExAlunos")
        }
        connection.close()
        self.assertEqual(exported_courses, set(courses))

    def test_export_rejects_symlinked_source_photo(self) -> None:
        self.create_source()
        outside = self.root / "outside.png"
        shutil.copyfile(
            cloud_data.REPO_ROOT / "static" / "images" / "ifsp.png",
            outside,
        )
        linked = self.source_photos / "active.png"
        linked.unlink()
        linked.symlink_to(outside)

        with self.assertRaises(cloud_data.CloudDataError):
            cloud_data.export_data(
                self.source_db,
                self.source_photos,
                self.root / "symlink-export",
            )

if __name__ == "__main__":
    unittest.main()
