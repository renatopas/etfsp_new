# etfsp.com

## Planejamento

- [Redesign responsivo da interface](docs/redesign/README.md)
- [Implantação com Docker, Caddy e Umami](deploy/README.md)

## Requisitos

### Ferramentas

- `pnpm`
- `node`
- `just`

Opcionais:

- `docker`

```bash
pnpm install
```

### Serviços

Cloudflare Turnstile, com um widget configurado para o domínio correto

## Desenvolver

```bash
export DB_PATH= #caminho pro banco sqlite
export FOTOS_DIR= #caminho pra pasta onde tem as fotos
# também suporta arquivo .env
just run
```

## Buildar

```bash
just build
```

ou

```bash
just build_container
```

## Rodando

### Local

```bash
  export DB_PATH= #caminho pro banco sqlite
  export FOTOS_DIR= #caminho pra pasta onde tem as fotos
  node ./build
```

### Docker

Para produção, use o [`compose.yaml`](compose.yaml) versionado e siga o
[guia de implantação](deploy/README.md). Os valores reais ficam no `.env` da
VPS; use [`.env.example`](.env.example) como referência.

Deploy da imagem por SSH:

```bash
just ssh=<HOSTNAME SSH> send_docker
```

Para execução isolada usando Docker CLI:

```bash
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
