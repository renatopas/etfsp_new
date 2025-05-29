import { db } from "$lib/db.js";
import { error } from "@sveltejs/kit";

interface LoadData {
    Operacao: string;
    Nome: string;
    Apelidos: string;
    Curso: string;
    TipoCurso: string;
    AnoInicio: string;
    AnoTermino: string;
    Email: string;
    ICQ: string;
    HomePage: string;
    Endereco: string;
    Cidade: string;
    Estado: string;
    CEP: string;
    Pais: string;
    Telefone: string;
    publica_telefone: string;
    DadoPubl: string;
    ComoEncontrou: string;
    ComoEncontrouExtra: string;
    Comentarios: string;
}

type Nullable<T> = {
    [K in keyof T]: K | null;
};

async function cadastrarAluno(dados: Partial<LoadData>): Promise<boolean> {
    if (!dados.Nome || !dados.Email || !dados.Curso) {
        return false;
    }

    delete dados.publica_telefone;
    delete dados.TipoCurso;
    delete dados.Operacao;

    return new Promise((res, rej) => {
        db.run(
            "INSERT INTO ExAlunos (\
                Nome,\
                Apelidos,\
                Curso,\
                AnoInicio,\
                AnoTermino,\
                Email,\
                ICQ,\
                HomePage,\
                Endereco,\
                Cidade,\
                Estado,\
                CEP,\
                Pais,\
                Telefone,\
                DadoPubl,\
                ComoEncontrou,\
                ComoEncontrouExtra,\
                Comentarios\
            ) VALUES (\
                $Nome,\
                $Apelidos,\
                $Curso,\
                $AnoInicio,\
                $AnoTermino,\
                $Email,\
                $ICQ,\
                $HomePage,\
                $Endereco,\
                $Cidade,\
                $Estado,\
                $CEP,\
                $Pais,\
                $Telefone,\
                $DadoPubl,\
                $ComoEncontrou,\
                $ComoEncontrouExtra,\
                $Comentarios\
            );",
            [
                dados.Nome ?? null,
                dados.Apelidos ?? null,
                dados.Curso ?? null,
                dados.AnoInicio ?? null,
                dados.AnoTermino ?? null,
                dados.Email ?? null,
                dados.ICQ ?? null,
                dados.HomePage ?? null,
                dados.Endereco ?? null,
                dados.Cidade ?? null,
                dados.Estado ?? null,
                dados.CEP ?? null,
                dados.Pais ?? null,
                dados.Telefone ?? null,
                dados.DadoPubl ?? null,
                dados.ComoEncontrou ?? null,
                dados.ComoEncontrouExtra ?? null,
                dados.Comentarios ?? null,
            ],
            (err) => {
                res(err == null);
                if (err) {
                    console.error(err, err.cause, err.stack, dados);
                } else {
                    console.debug("usuario adicionado", dados);
                }
            },
        );
    });
}

export const load = async ({ url, request }) => {
    // TODO: lógica de banco de dados

    const params = [
        "Operacao",
        "Nome",
        "Apelidos",
        "Curso",
        "TipoCurso",
        "AnoInicio",
        "AnoTermino",
        "Email",
        "ICQ",
        "HomePage",
        "Endereco",
        "Cidade",
        "Estado",
        "CEP",
        "Pais",
        "Telefone",
        "publica_telefone",
        "DadoPubl",
        "ComoEncontrou",
        "ComoEncontrouExtra",
        "Comentarios",
    ];

    const form = url.searchParams;
    let data: Partial<LoadData> = {};
    for (const param of params) {
        const p = form.get(param);
        if (p) {
            data[param as keyof LoadData] = p;
        }
    }
    if (!data.Curso) {
        error(400, "Falta parametro curso");
    }
    if (!data.AnoTermino) {
        error(400, "Falta parametro ano_termino");
    }

    cadastrarAluno(data);

    return data;
};
