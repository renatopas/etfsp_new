import sqlite3
import pandas as pd
import datetime
import os
from urllib.parse import urlsplit, urlunsplit

exalunos = pd.read_csv("./ExAlunos.csv")
fotos = pd.read_csv("./Foto.csv")

print(exalunos.columns)

if os.path.isfile("./db.sqlite3"):
    os.remove("./db.sqlite3")
con = sqlite3.connect("./db.sqlite3")
cur = con.cursor()
cur.executescript(open("./initial.sql").read())

# converte dia/mes/ano pra unix timestamp em ms
def dma_to_unix(val: str) -> int:
    assert(len(val) == 10)
    val_split = val.split("/")
    assert(len(val_split) == 3)
    day = datetime.datetime(
        int(val_split[2]),
        int(val_split[1]),
        int(val_split[0]),
        12,
        0,
        0,
        0,
        datetime.timezone(datetime.timedelta(0,0,0,0,0,-3,0))
    )
    assert day.day == int(val_split[0])
    assert day.month == int(val_split[1])
    assert day.year == int(val_split[2])
    return round(day.timestamp() * 1000)

SOCIAL_DOMAINS = {
    "Instagram": "instagram.com",
    "Facebook": "facebook.com",
    "LinkedIn": "linkedin.com",
}


def social_url(row, field: str):
    if field not in row.index or not isinstance(row[field], str):
        return None

    value = row[field].strip()
    if not value or len(value) > 500:
        return None

    try:
        parsed = urlsplit(value)
        hostname = (parsed.hostname or "").lower()
        domain = SOCIAL_DOMAINS[field]
        if (
            parsed.scheme != "https"
            or not (hostname == domain or hostname.endswith("." + domain))
            or parsed.username
            or parsed.password
            or parsed.netloc.lower() != hostname
        ):
            return None
        normalized = urlunsplit(
            (parsed.scheme, parsed.netloc, parsed.path, parsed.query, "")
        )
        return normalized if len(normalized) <= 500 else None
    except ValueError:
        return None


def whatsapp(row):
    if "WhatsApp" not in row.index or not isinstance(row["WhatsApp"], str):
        return None

    value = row["WhatsApp"].strip()
    if not value.startswith("+"):
        return None

    for separator in (" ", "(", ")", "-"):
        value = value.replace(separator, "")

    digits = value[1:]
    if (
        not digits.isdigit()
        or not 8 <= len(digits) <= 15
        or digits.startswith("0")
    ):
        return None
    return "+" + digits


for (_, row) in exalunos.iterrows():
    try:
        data_cadastro = row["DtCadastro"]
        if type(data_cadastro) == str :
            row["DtCadastro"] = dma_to_unix(data_cadastro)

        data_atualizacao = row["DtAtualizacao"]
        if type(data_atualizacao) == str :
            row["DtAtualizacao"] = dma_to_unix(data_atualizacao)

        if row["Listserv"] == "Sim":
            row["Listserv"] = True
        else:
            row["Listserv"] = False

        if row["PublicaTelefone"] == "Sim":
            row["PublicaTelefone"] = True
        else:
            row["PublicaTelefone"] = False

        row["Excluido"] = row["Excluido"] == "VERDADEIRO"
        row["OcultarEmail"] = row["OcultarEmail"] == "VERDADEIRO"
        row["InscricaoInicialML"] = row["InscricaoInicialML"] == "VERDADEIRO"
        row["NaoVerificaDuplicidade"] = row["NaoVerificaDuplicidade"] == "VERDADEIRO"
        row["Instagram"] = social_url(row, "Instagram")
        row["Facebook"] = social_url(row, "Facebook")
        row["LinkedIn"] = social_url(row, "LinkedIn")
        row["WhatsApp"] = whatsapp(row)

        cur.execute("INSERT INTO ExAlunos (" \
            "ID," \
            "Nome," \
            "Excluido," \
            "Curso," \
            "AnoInicio," \
            "AnoTermino," \
            "Email," \
            "OcultarEmail," \
            "EmailAlternativo," \
            "ICQ," \
            "Apelidos," \
            "Endereco," \
            "Cidade," \
            "Estado," \
            "CEP," \
            "Pais," \
            "Telefone," \
            "HomePage," \
            "Instagram," \
            "Facebook," \
            "LinkedIn," \
            "WhatsApp," \
            "DadoPubl," \
            "ComoEncontrou," \
            "ComoEncontrouExtra," \
            "Comentarios," \
            "DtCadastro," \
            "DtAtualizacao," \
            "CPF," \
            "Prontuario," \
            "lixo_homepage," \
            "Listserv," \
            "Browser," \
            "RemoteUserIP," \
            "PublicaTelefone," \
            "Operacao," \
            "InscricaoInicialML," \
            "Aux," \
            "NaoVerificaDuplicidade," \
            "lixo" \
        ")" \
        "VALUES (" \
            ":ID," \
            ":Nome," \
            ":Excluido," \
            ":Curso," \
            ":AnoInicio," \
            ":AnoTermino," \
            ":Email," \
            ":OcultarEmail," \
            ":EmailAlternativo," \
            ":ICQ," \
            ":Apelidos," \
            ":Endereco," \
            ":Cidade," \
            ":Estado," \
            ":CEP," \
            ":Pais," \
            ":Telefone," \
            ":HomePage," \
            ":Instagram," \
            ":Facebook," \
            ":LinkedIn," \
            ":WhatsApp," \
            ":DadoPubl," \
            ":ComoEncontrou," \
            ":ComoEncontrouExtra," \
            ":Comentarios," \
            ":DtCadastro," \
            ":DtAtualizacao," \
            ":CPF," \
            ":Prontuario," \
            ":lixo_homepage," \
            ":Listserv," \
            ":Browser," \
            ":RemoteUserIP," \
            ":PublicaTelefone," \
            ":Operacao," \
            ":InscricaoInicialML," \
            ":Aux," \
            ":NaoVerificaDuplicidade," \
            ":lixo" \
        ")", row.to_dict())
        # col = cur.execute("SELECT (Nome) FROM ExAlunos WHERE ID = :ID", {"ID": row["ID"]}).fetchone()
        # print(col)
    except sqlite3.IntegrityError as e:
        print(e)
        print(row)
        exit(1)
    except Exception as e:
        print(e)
        print(row)
        exit(1)

for (_a, row) in fotos.iterrows():
    if row["Carometro"] == "VERDADEIRO":
        row["Carometro"] = True
    else:
        row["Carometro"] = False

    if row["FotoPessoal"] == "VERDADEIRO":
        row["FotoPessoal"] = True
    else:
        row["FotoPessoal"] = False

    if row["Excluido"] == "VERDADEIRO":
        row["Excluido"] = True
    else:
        row["Excluido"] = False

    data_upload_foto = row["DtUploadFoto"]
    if type(data_upload_foto) == str:
        row["DtUploadFoto"] = dma_to_unix(data_upload_foto)

    cur.execute(
        "INSERT INTO Fotos (" \
            "idFoto," \
            "NomeArqOriginal," \
            "NomeArqStored," \
            "NomeMiniaturaStored," \
            "CursoFoto," \
            "AnoFoto," \
            "TituloFoto," \
            "AnoFormatura," \
            "Carometro," \
            "TurmaFoto," \
            "idExAlunoUpload," \
            "FotoPessoal," \
            "EmailFoto," \
            "DtUploadFoto," \
            "TamanhoFoto," \
            "ContentType," \
            "OrigLargura," \
            "OrigAltura," \
            "Excluido" \
        ") VALUES (" \
            ":idFoto," \
            ":NomeArqOriginal," \
            ":NomeArqStored," \
            ":NomeMiniaturaStored," \
            ":CursoFoto," \
            ":AnoFoto," \
            ":TituloFoto," \
            ":AnoFormatura," \
            ":Carometro," \
            ":TurmaFoto," \
            ":idExAlunoUpload," \
            ":FotoPessoal," \
            ":EmailFoto," \
            ":DtUploadFoto," \
            ":TamanhoFoto," \
            ":ContentType," \
            ":OrigLargura," \
            ":OrigAltura," \
            ":Excluido" \
        ")",
        row.to_dict()
    )



cur.close()
con.commit()
con.close()
