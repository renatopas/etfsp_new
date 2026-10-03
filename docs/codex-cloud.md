# Trabalho com o Codex Cloud

Este guia separa duas operações:

1. a manutenção local da fixture, que pode ler o banco e as fotos do WSL;
2. a inicialização das tarefas no Codex Cloud, que cria o banco do zero usando
   somente a fixture versionada.

O Codex Cloud não recebe acesso automático ao WSL, ao `.env` nem aos arquivos
ignorados pelo Git.

## Referência do produto

Este procedimento foi conferido em 2 de outubro de 2026 com a
[documentação oficial de ambientes Cloud](https://learn.chatgpt.com/docs/environments/cloud-environments).

Segundo essa documentação:

- cada nova tarefa recebe um workspace isolado a partir do ambiente publicado;
- publicar um ambiente captura o filesystem preparado para novas tarefas;
- o ambiente pode guardar um install script e uma start skill;
- tarefas existentes preservam seus próprios arquivos, inclusive mudanças ainda
  não commitadas;
- a configuração publicada deve ser republicada para afetar novas tarefas;
- o estado salvo não substitui controle de versão.

A interface e as permissões podem variar por conta. Se um controle descrito aqui
não aparecer, use `scripts/init_cloud.sh` como baseline e não improvise a
transferência de dados por outro canal.

## Arquitetura dos dados

```text
manutenção local, executada uma vez
fontes do WSL ──► export privado ──► descaracterização e revisão
                                           │
                                           ▼
                              fixtures/cloud/ (sintético e versionado)
                                                │
                                                ▼
tarefa Cloud ou clone limpo
scripts/init_cloud.sh ──► scripts/cloud_data.py init
                                                │
                                                ▼
                                      .cloud-data/ (ignorado)
                                      ├── db.sqlite3
                                      ├── Fotos/
                                      └── manifest.json
```

O comando `init` cria um SQLite novo com `scripts/initial.sql`, carrega
`fixtures/cloud/seed.json`, copia dois placeholders institucionais e valida o
resultado. Ele não lê `.env`, não procura um banco anterior e não acessa as
fotos do WSL. A fixture não contém pessoas ou fotos reais.

Há também o modo `sample`, que cria três ex-alunos inteiramente fictícios e
duas fotos a partir de `static/images`. Ele é uma alternativa mínima, não o
fluxo padrão do ambiente Cloud.

## Exportação intermediária e fixture final

A ferramenta local de exportação usa uma lista positiva de campos. Sua saída é
intermediária, ainda preserva alguns dados públicos reais e nunca deve ser
versionada.

| Grupo                               | Tratamento                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| Identificação pública               | Mantém ID e nome dos registros não excluídos                                        |
| Histórico escolar público           | Mantém curso e anos de ingresso/saída                                               |
| Perfil público                      | Mantém apelido, homepage, redes sociais, WhatsApp, ICQ, texto público e comentários |
| E-mail                              | Mantém somente quando `OcultarEmail = 0`                                            |
| Telefone                            | Mantém somente quando `PublicaTelefone = 1`                                         |
| Dados históricos privados           | Define como `NULL`                                                                  |
| Flags de mailing list e duplicidade | Neutraliza                                                                          |
| Registros excluídos                 | Não exporta                                                                         |
| Fotos                               | Exporta somente fotos ativas ligadas a ex-alunos ativos                             |
| Nome original e e-mail da foto      | Substitui o nome e remove o e-mail                                                  |
| Arquivos de imagem                  | Reprocessa com `sharp` e grava nomes controlados                                    |

São sempre removidos endereço, cidade, estado, CEP, país, e-mail alternativo,
origem do cadastro, data de atualização, CPF, prontuário, browser, IP e campos
auxiliares legados.

Os campos mantidos são os que as rotas públicas atuais utilizam. Uma nova rota
ou mudança de visibilidade exige revisar a lista positiva antes de atualizar o
pacote intermediário.

A fixture final segue regras mais restritivas: IDs, nomes, apelidos, anos e
e-mails são sintéticos; contatos e redes sociais ficam ausentes; e-mails usam
`example.invalid`; e fotos reais são substituídas por dois placeholders
institucionais.

## Garantias do gerador

O pacote gerado pelo comando `export` não é anonimizado: nomes e demais
campos já públicos continuam reais. A sanitização remove campos privados e
metadados, enquanto a amostragem limita a exposição e o tamanho. Por isso, o
pacote continua sendo um artefato privado e nunca deve ser versionado.

O utilitário:

- seleciona deterministicamente no máximo 30 ex-alunos, distribuídos entre os
  cursos e priorizando registros com foto;
- inclui no máximo 30 fotos pertencentes aos ex-alunos selecionados;
- recebe caminhos explicitamente e nunca carrega o `.env`;
- abre o banco de origem com `mode=ro` e `PRAGMA query_only`;
- recusa origem e destino sobrepostos;
- recusa sobrescrever um destino existente;
- gera tudo primeiro em diretório temporário;
- publica a saída somente após validação;
- confere hashes do banco e de toda a árvore de fotos antes e depois;
- não imprime caminhos, registros ou valores privados;
- valida integridade SQLite, chaves estrangeiras, view, campos privados,
  arquivos ausentes, arquivos órfãos, nomes e checksums;
- limita o pacote a 250 MiB por padrão.

O helper `scripts/sanitize_cloud_photos.mjs` decodifica cada imagem com
`sharp`, aplica orientação, limita pixels e cria WebP e miniatura novos. Assim,
nomes originais e metadados não seguem para o pacote.

## Pré-requisitos locais

- Node.js 24;
- pnpm 10.11.0;
- Python 3.11 ou posterior;
- dependências instaladas com `pnpm install --frozen-lockfile`.

Confira as versões:

```sh
node --version
pnpm --version
python3 --version
```

## Atualizar a fixture a partir dos dados locais

Esta seção é manutenção local e não é executada no Cloud. Não execute
`scripts/make_db.py`; ele é um importador legado destrutivo.

Informe os caminhos absolutos explicitamente. Não use `source .env`:

```sh
python3 scripts/cloud_data.py export \
  --source-db /caminho/absoluto/do/banco.sqlite3 \
  --source-photos /caminho/absoluto/das/Fotos \
  --output .cloud-data
```

A saída existente não é substituída. Para conservar a anterior antes de gerar
outra, mova-a para um nome de backup escolhido conscientemente:

```sh
mv .cloud-data .cloud-data.anterior
```

Valide novamente a qualquer momento:

```sh
pnpm run cloud:data:check
```

Crie um arquivo de transporte validado:

```sh
pnpm run cloud:data:pack
```

Isso produz `.cloud-data.tar.gz`, também ignorado pelo Git, apenas para revisão
ou transporte local. Para atualizar `fixtures/cloud/`, a amostra deve ser
inspecionada, convertida em `seed.json` e fotos sanitizadas e revisada no diff.
Esse procedimento de preparação pode ser descartado depois; tarefas Cloud nunca
o executam.

## Gerar somente a amostra fictícia

Em um clone que não tenha acesso às fontes locais:

```sh
pnpm run cloud:data:sample
pnpm run cloud:data:check
```

O comando também recusa sobrescrever `.cloud-data`.

## Testar o pacote localmente

Execute os testes específicos:

```sh
pnpm run test:cloud-data
```

Inicie a aplicação sem alterar o `.env`:

```sh
DB_PATH=.cloud-data/db.sqlite3 \
FOTOS_DIR=.cloud-data/Fotos \
pnpm run dev -- --host 127.0.0.1
```

Verifique pelo menos:

- página inicial;
- `/exalunos_lista`;
- `/exalunos/1`;
- `/lista_foto`;
- uma URL `/Fotos/...` presente no banco;
- abertura de `/novocadastro`;
- abertura de `/cadfoto`.

O cadastro usa as chaves oficiais de teste do Turnstile automaticamente em modo
de desenvolvimento. Analytics permanece desabilitado quando
`PUBLIC_UMAMI_URL` e `PUBLIC_UMAMI_WEBSITE_ID` não são definidos.

Finalize com:

```sh
pnpm run validate
```

## Criar o ambiente Cloud

Na interface do Codex:

1. escolha **Work in > Cloud**;
2. crie um ambiente e selecione este repositório;
3. mantenha **Who can use: Only me** durante a validação inicial;
4. permita rede somente para **Package managers**;
5. não adicione segredos de produção;
6. use o install script e a start skill abaixo;
7. revise os arquivos preparados;
8. publique o ambiente;
9. abra uma nova tarefa para validar o resultado.

### Install script recomendado

A configuração mínima e reproduzível chama o inicializador versionado:

```sh
bash scripts/init_cloud.sh
```

O script instala as dependências, cria `.cloud-data/db.sqlite3` do zero com
`pnpm run cloud:data:init` quando o destino não existe e valida banco e fotos.
Em um clone limpo, ele depende apenas dos arquivos do repositório e do registro
de pacotes.

Configure estas variáveis não secretas no ambiente:

```text
DB_PATH=.cloud-data/db.sqlite3
FOTOS_DIR=.cloud-data/Fotos
```

Não configure as variáveis do Umami. Para desenvolvimento com Vite, também não
é necessário configurar as chaves de produção do Turnstile.

### Start skill recomendada

Registre instruções equivalentes a:

> No diretório do repositório, valide o pacote com
> `pnpm run cloud:data:check`. Inicie `pnpm run dev -- --host 0.0.0.0` em
> segundo plano, aguarde até `http://127.0.0.1:5173/` responder e informe a
> porta 5173. Antes de encerrar a tarefa, finalize apenas o processo iniciado
> por esta instrução.

### Independência das fontes locais

O Cloud não precisa receber `.cloud-data.tar.gz`, banco ou fotos do WSL.
`fixtures/cloud/` já contém a carga sanitizada e as imagens necessárias. Cada
ambiente ou clone limpo reconstrói `.cloud-data/` localmente.

O exportador que leu o acervo original foi apenas uma ferramenta da preparação
local. Ele não é chamado por `scripts/init_cloud.sh` nem por uma tarefa futura.

## Tarefas, workspaces e branches

- **Ambiente:** configuração reutilizável publicada.
- **Tarefa:** unidade de trabalho iniciada a partir de um ambiente.
- **Turno:** nova mensagem que continua a mesma tarefa.
- **Workspace:** cópia isolada mantida por aquela tarefa.
- **Branch:** forma de levar as mudanças revisadas para o Git.

Cada nova tarefa começa do filesystem do ambiente publicado, mas depois mantém
seus próprios arquivos. Duas tarefas não compartilham mudanças não integradas.

Para cada tarefa futura:

1. dê um título que descreva um único objetivo;
2. parta da referência remota atualizada;
3. use uma branch `codex/<objetivo-curto>`;
4. peça que o agente execute `pnpm run validate`;
5. revise o diff e as limitações;
6. faça commit ou abra um pull request;
7. não faça merge automático em `main`.

Se duas tarefas alterarem o mesmo arquivo, integre uma primeiro, atualize a
segunda branch e repita as validações.

## Atualizar o ambiente

Quando scripts, dependências ou dados mudarem:

1. prepare e valide a mudança localmente;
2. integre os arquivos versionados;
3. abra **Settings > Codex Cloud > Environments**;
4. edite o ambiente;
5. deixe `scripts/init_cloud.sh` reconstruir os dados a partir da fixture;
6. valide;
7. republique;
8. abra uma nova tarefa.

Tarefas já existentes conservam o estado anterior. Apenas novas tarefas usam a
nova publicação.

## Handoff para a primeira tarefa Cloud

Use uma tarefa separada com este objetivo:

> Validar o ambiente ETFSP publicado sem acessar dados locais. Confirme o
> manifesto com `pnpm run cloud:data:check`, execute
> `pnpm run check`, `pnpm run lint` e `pnpm run build`, inicie o servidor,
> faça smoke tests dos fluxos públicos e relate o diff sem alterar o pacote de
> origem.

Depois, abra duas tarefas pequenas em paralelo e confirme que seus workspaces
não compartilham mudanças não commitadas.

## Regras de segurança

- Nunca copie o `.env` local para o Cloud.
- Nunca use o banco de produção como `DB_PATH` em uma tarefa Cloud.
- Nunca use o diretório local de fotos como `FOTOS_DIR` no Cloud.
- Nunca execute `git clean -fdx` para atualizar o pacote.
- Nunca registre caminhos das fontes, registros completos ou valores privados.
- Nunca substitua um pacote existente sem revisão.
- Mantenha o ambiente privado até concluir a tarefa piloto.
- A fixture versionada contém somente perfis sintéticos e placeholders
  institucionais. Trate bancos gerados e qualquer exportação intermediária como
  descartáveis e não os adicione ao Git.
