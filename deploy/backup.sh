#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if [ -f "$script_dir/compose.yaml" ]; then
  project_dir=$script_dir
elif [ -f "$script_dir/../compose.yaml" ]; then
  project_dir=$(CDPATH= cd -- "$script_dir/.." && pwd)
else
  echo "Erro: compose.yaml não foi encontrado junto ao script nem no diretório pai." >&2
  exit 1
fi

backup_root=${BACKUP_DIR:-"$project_dir/backups"}
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
destination="$backup_root/$timestamp"
dump_sql="$destination/umami.sql"

cleanup() {
  if [ -f "$dump_sql" ]; then
    rm -f -- "$dump_sql"
  fi
}

trap cleanup EXIT HUP INT TERM

mkdir -p "$destination"

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "Erro: instale o cliente sqlite3 na VPS para criar um backup consistente." >&2
  exit 1
fi

if [ ! -f "$project_dir/db.sqlite3" ]; then
  echo "Erro: $project_dir/db.sqlite3 não foi encontrado." >&2
  exit 1
fi

sqlite3 "$project_dir/db.sqlite3" ".backup '$destination/db.sqlite3'"

if [ -d "$project_dir/Fotos" ]; then
  tar -C "$project_dir" -czf "$destination/Fotos.tar.gz" Fotos
fi

if ! docker compose --project-directory "$project_dir" --file "$project_dir/compose.yaml" \
  exec -T umami-db pg_dump -U umami --clean --if-exists umami >"$dump_sql"; then
  echo "Erro: pg_dump do banco do Umami falhou; veja a mensagem acima." >&2
  exit 1
fi

if [ ! -s "$dump_sql" ]; then
  echo "Erro: pg_dump terminou sem gerar conteúdo." >&2
  exit 1
fi

gzip -c "$dump_sql" >"$destination/umami.sql.gz"
rm -f -- "$dump_sql"

echo "Backup criado em $destination"
echo "Envie esse diretório para armazenamento externo e remova cópias locais antigas."
