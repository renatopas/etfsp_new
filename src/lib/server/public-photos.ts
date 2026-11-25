import { isCourse, type PublicPhoto } from "$lib/domain";

/**
 * Regras compartilhadas para expor fotos publicamente.
 *
 * As consultas devem usar o alias `f` para a tabela `Fotos`, sempre incluir
 * `VISIBLE_PHOTO_CLAUSE` e selecionar somente `PUBLIC_PHOTO_COLUMNS`.
 */
export const VISIBLE_PHOTO_CLAUSE = "f.Excluido = 0";

export const PUBLIC_PHOTO_COLUMNS =
  "f.TituloFoto,f.CursoFoto,f.TurmaFoto,f.AnoFoto,f.AnoFormatura,f.NomeMiniaturaStored,f.NomeArqStored";

export interface PublicPhotoRow {
  TituloFoto: string | null;
  CursoFoto: string | null;
  TurmaFoto: string | null;
  AnoFoto: number | null;
  AnoFormatura: number | null;
  NomeMiniaturaStored: string;
  NomeArqStored: string;
}

export function toPublicPhoto(row: PublicPhotoRow): PublicPhoto {
  return {
    title: row.TituloFoto?.trim() || undefined,
    course: isCourse(row.CursoFoto) ? row.CursoFoto : undefined,
    className: row.TurmaFoto?.trim() || undefined,
    photoYear: row.AnoFoto ?? undefined,
    graduationYear: row.AnoFormatura ?? undefined,
    thumbnailUrl: `/Fotos/${encodeURIComponent(row.NomeMiniaturaStored)}`,
    imageUrl: `/Fotos/${encodeURIComponent(row.NomeArqStored)}`,
  };
}
