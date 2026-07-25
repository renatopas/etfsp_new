#!/bin/sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
backup_root=${BACKUP_DIR:-"$project_dir/backups"}
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
destination="$backup_root/$timestamp"

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

docker compose --project-directory "$project_dir" exec -T umami-db \
  pg_dump -U umami --clean --if-exists umami |
  gzip >"$destination/umami.sql.gz"

echo "Backup criado em $destination"
echo "Envie esse diretório para armazenamento externo e remova cópias locais antigas."
