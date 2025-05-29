import { default as sqlite } from "sqlite3";
console.log(sqlite);
sqlite.verbose();

export const db = new sqlite.Database("db.sqlite3");

export type PartialRange = [number | undefined, number | undefined];

export interface Foto {
    titulo?: string;
    curso?: string;
    anoFoto?: number;
    anoFormatura?: number;
}

export async function pesquisarFotos(
    titulo?: string,
    range_ano_foto?: PartialRange,
    range_ano_formatura?: PartialRange,
    curso?: string,
    isCarometro?: boolean,
): Promise<Foto[]> {
    db.all(
        "SELECT * FROM Fotos WHERE \
        ",
    );
}
