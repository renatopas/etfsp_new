BEGIN;

CREATE TABLE ExAlunos (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Nome TEXT NOT NULL,
  Excluido INTEGER NOT NULL CHECK (Excluido IN (0, 1)) DEFAULT 0,
  Curso TEXT,
  AnoInicio INTEGER,
  AnoTermino INTEGER,
  Email TEXT,
  OcultarEmail INTEGER NOT NULL CHECK (OcultarEmail IN (0, 1)) DEFAULT 0,
  EmailAlternativo TEXT,
  ICQ TEXT,
  Apelidos TEXT,
  Endereco TEXT,
  Cidade TEXT,
  Estado TEXT,
  CEP TEXT,
  Pais TEXT,
  Telefone TEXT,
  HomePage TEXT,
  Instagram TEXT,
  Facebook TEXT,
  LinkedIn TEXT,
  DadoPubl TEXT,
  ComoEncontrou TEXT,
  ComoEncontrouExtra TEXT,
  Comentarios TEXT,
  DtCadastro INTEGER,
  DtAtualizacao INTEGER,
  CPF TEXT,
  Prontuario TEXT,
  lixo_homepage TEXT,
  Listserv INTEGER CHECK (Listserv IN (0, 1)),
  Browser TEXT,
  RemoteUserIP TEXT,
  PublicaTelefone INTEGER NOT NULL CHECK (PublicaTelefone IN (0, 1)) DEFAULT 0,
  Operacao TEXT,
  InscricaoInicialML INTEGER NOT NULL CHECK (InscricaoInicialML IN (0, 1)) DEFAULT 1,
  Aux TEXT,
  NaoVerificaDuplicidade INTEGER NOT NULL CHECK (NaoVerificaDuplicidade IN (0, 1)) DEFAULT 0,
  lixo TEXT
) STRICT;

CREATE TABLE SchemaMigrations (
  ID TEXT PRIMARY KEY,
  AppliedAt INTEGER NOT NULL
) STRICT;

INSERT INTO SchemaMigrations (ID, AppliedAt)
VALUES (
  '2026-07-29-add-social-networks',
  CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)
);

CREATE TABLE Fotos (
  idFoto INTEGER PRIMARY KEY AUTOINCREMENT,
  NomeArqOriginal TEXT NOT NULL,
  NomeArqStored TEXT NOT NULL,
  NomeMiniaturaStored TEXT NOT NULL,
  CursoFoto TEXT,
  AnoFoto INTEGER,
  TituloFoto TEXT,
  AnoFormatura INTEGER,
  Carometro INTEGER NOT NULL CHECK (Carometro IN (0, 1)) DEFAULT 0,
  TurmaFoto TEXT,
  idExAlunoUpload INTEGER NOT NULL REFERENCES ExAlunos (ID) ON UPDATE CASCADE,
  FotoPessoal INTEGER NOT NULL CHECK (FotoPessoal IN (0, 1)),
  EmailFoto TEXT,
  DtUploadFoto INTEGER,
  TamanhoFoto INTEGER,
  ContentType TEXT,
  OrigLargura INTEGER,
  OrigAltura INTEGER,
  Excluido INTEGER NOT NULL CHECK (Excluido IN (0, 1)) DEFAULT 0
) STRICT;

CREATE VIEW qryExAlunos AS
SELECT
  ID,
  Nome,
  Curso,
  Apelidos,
  Curso,
  AnoInicio,
  AnoTermino,
  Email,
  HomePage,
  ICQ,
  DtCadastro,
  Comentarios,
  ComoEncontrou,
  ComoEncontrouExtra,
  DadoPubl,
  NomeMiniaturaPes,
  QtdFotos
FROM ExAlunos
LEFT JOIN
  (SELECT
    idExAlunoUpload,
    MAX(idFoto) AS maxIdFoto,
    COUNT(idFoto) AS QtdFotos,
    NomeMiniaturaStored as NomeMiniaturaPes
  FROM Fotos
  WHERE Excluido = 0 AND FotoPessoal = 1
  GROUP BY idExAlunoUpload)
ON ExAlunos.ID = idExAlunoUpload
WHERE ExAlunos.Excluido = 0;

COMMIT;
