# etfsp.com

Site de ex-alunos da antiga ETFSP.

## Documentação

- [Trabalho local e no Codex Cloud](docs/codex-cloud.md)
- [Redesign responsivo da interface](docs/redesign/README.md)
- [Implantação com Docker, Caddy e Umami](deploy/README.md)
- [Issues de planejamento](docs/issues/README.md)

## Requisitos

- Node.js 24;
- pnpm 10.11.0;
- Python 3.11 ou posterior, para preparar dados de desenvolvimento;
- `just`, para os comandos legados;
- Docker, opcional.

```sh
corepack enable
pnpm install --frozen-lockfile
```

## Desenvolvimento local

Defina explicitamente o banco SQLite e o diretório gravável de fotos:

```sh
DB_PATH=/caminho/para/db.sqlite3 \
FOTOS_DIR=/caminho/para/Fotos \
pnpm run dev
```

Não use o banco ou as fotos de produção em testes destrutivos.

### Dados para desenvolvimento e Cloud

Para criar o banco do zero a partir da fixture sanitizada versionada:

```sh
pnpm run cloud:data:init
pnpm run cloud:data:check

DB_PATH=.cloud-data/db.sqlite3 \
FOTOS_DIR=.cloud-data/Fotos \
pnpm run dev
```

Esse comando não lê `.env`, banco ou fotos externas. A fixture contém 30
perfis fictícios e descaracterizados e duas imagens institucionais genéricas;
não contém nomes, contatos, identificadores ou fotos de pessoas reais.

Para atualizar a fixture a partir do acervo local, consulte o
[guia do Codex Cloud](docs/codex-cloud.md). Essa manutenção ocorre somente no
WSL autorizado e não faz parte da inicialização Cloud.

## Validação

```sh
pnpm run test:cloud-data
pnpm run validate
```

O script `validate` executa check, lint e build. Os alvos `just run` e
`just build` formatam todo o repositório; evite-os quando houver alterações
não relacionadas.

## Build

```sh
pnpm run build
```

Para criar a imagem:

```sh
just build_container
```

## Execução do build Node

```sh
DB_PATH=/caminho/para/db.sqlite3 \
FOTOS_DIR=/caminho/para/Fotos \
CF_TURNSTILE_SECRET=<segredo> \
PUBLIC_CF_TURNSTILE_SITEKEY=<site-key> \
node ./build
```

## Docker

Para produção, use o [`compose.yaml`](compose.yaml) versionado e siga o
[guia de implantação](deploy/README.md). Os valores reais ficam no `.env` da
VPS; use [`.env.example`](.env.example) como referência.

Deploy da imagem por SSH:

```sh
just ssh=<HOSTNAME SSH> send_docker
```

Para execução isolada usando Docker CLI:

```sh
docker run \
  -p 3000:3000 \
  -e 'DB_PATH=/database/db.sqlite3' \
  -e 'FOTOS_DIR=/Fotos' \
  -e 'CF_TURNSTILE_SECRET=<segredo>' \
  -e 'PUBLIC_CF_TURNSTILE_SITEKEY=<site-key>' \
  -v ./db.sqlite3:/database/db.sqlite3 \
  -v ./Fotos:/Fotos \
  etfsp:latest
```
