import type { AlumniListItem } from "$lib/domain";

/**
 * Consulta pública dos itens da relação de ex-alunos.
 *
 * Seleciona apenas os campos exibidos no cartão e a miniatura da foto pessoal
 * mais recente não excluída. Quem usa este fragmento deve acrescentar um
 * `WHERE` que inclua `e.Excluido = 0`, além da ordenação e do limite.
 */
export const ALUMNI_LIST_SELECT = `SELECT
      e.ID,
      e.Nome,
      e.Apelidos,
      e.Curso,
      e.AnoInicio,
      e.AnoTermino,
      foto.NomeMiniaturaStored
    FROM ExAlunos AS e
    LEFT JOIN Fotos AS foto ON foto.idFoto = (
      SELECT f.idFoto
      FROM Fotos AS f
      WHERE f.idExAlunoUpload = e.ID
        AND f.Excluido = 0
        AND f.FotoPessoal = 1
      ORDER BY f.idFoto DESC
      LIMIT 1
    )`;

export interface AlumniListRow {
  ID: number;
  Nome: string;
  Apelidos: string | null;
  Curso: string | null;
  AnoInicio: number | null;
  AnoTermino: number | null;
  NomeMiniaturaStored: string | null;
}

function toOptionalText(value: string | null): string | undefined {
  const text = value?.trim();
  return text || undefined;
}

function toOptionalYear(value: number | null): number | undefined {
  return value !== null && Number.isInteger(value) ? value : undefined;
}

export function toAlumniListItem(row: AlumniListRow): AlumniListItem {
  return {
    id: row.ID,
    name: row.Nome,
    nickname: toOptionalText(row.Apelidos),
    course: toOptionalText(row.Curso),
    startYear: toOptionalYear(row.AnoInicio),
    endYear: toOptionalYear(row.AnoTermino),
    thumbnail: toOptionalText(row.NomeMiniaturaStored),
  };
}
