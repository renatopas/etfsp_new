# etfsp.com

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

```bash
docker run \
  -p 3000:3000 \
  -e DB_PATH=/database/db.sqlite3 \
  -e FOTOS_DIR=/Fotos \
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
