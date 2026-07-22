# etfsp.com

## Planejamento

- [Redesign responsivo da interface](docs/redesign/README.md)

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

Deploy da imagem por SSH:

```bash
just ssh=<HOSTNAME SSH> send_docker
```

Usando Docker CLI:

```bash
docker run \
  -p 3000:3000 \
  -e 'DB_PATH=/database/db.sqlite3' \
  -e 'FOTOS_DIR=/Fotos' \
  -e 'CF_TURNSTILE_SECRET=0x48632984732619423' \
  -e 'PUBLIC_CF_TURNSTILE_SITEKEY=0xfff6f85638741' \
  -v ./db.sqlite3:/database/db.sqlite3 \
  -v ./Fotos:/Fotos \
  etfsp:latest
```

ou com Docker Compose:

```yaml
# /compose.yaml
services:
  etfsp:
    image: etfsp:latest
    environment:
      - "DB_PATH=/database/db.sqlite3"
      - "FOTOS_DIR=/Fotos"
      - "CF_TURNSTILE_SECRET=0x48632984732619423"
      - "PUBLIC_CF_TURNSTILE_SITEKEY=0xfff6f85638741"
    volumes:
      - "./db.sqlite3:/database/db.sqlite3"
      - "./Fotos:/Fotos"
    ports:
      - "3000:3000"
    restart: always
```

```bash
docker compose up -d
```
