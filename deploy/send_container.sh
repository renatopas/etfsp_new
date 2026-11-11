#!/usr/bin/env bash
set -euo pipefail

remote=${1:-}
project_dir=${2:-/home/ubuntu/etfsp}
health_url=http://127.0.0.1:3000/

if [[ -z "$remote" || "$remote" == -* ]]; then
  echo "Erro: informe um hostname ou alias SSH válido." >&2
  exit 1
fi

if [[ ! "$project_dir" =~ ^/[A-Za-z0-9._/-]+$ ]]; then
  echo "Erro: o diretório remoto deve ser um caminho absoluto simples." >&2
  exit 1
fi

for command in docker jq pv ssh zstd; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Erro: o comando local '$command' não está disponível." >&2
    exit 1
  fi
done

version=$(jq -er '.version | select(type == "string" and length > 0)' package.json)
previous_image=$(
  ssh "$remote" "docker image ls --no-trunc -q etfsp:latest | head -n 1"
)

if [[ ! "$previous_image" =~ ^sha256:[0-9a-f]{64}$ ]]; then
  echo "Erro: não foi possível identificar a imagem etfsp:latest atual na VPS." >&2
  exit 1
fi

activate_remote() {
  local mode=$1
  local rollback_image=${2:--}

  ssh "$remote" sh -s -- "$project_dir" "$health_url" "$mode" "$rollback_image" <<'REMOTE_SCRIPT'
set -eu

project_dir=$1
health_url=$2
mode=$3
rollback_image=$4

cd "$project_dir"

if [ "$mode" = rollback ]; then
  docker tag "$rollback_image" etfsp:latest
fi

if ! docker compose up -d --no-deps --force-recreate etfsp; then
  docker compose logs --tail=100 etfsp >&2 || true
  exit 1
fi

attempt=1
while [ "$attempt" -le 15 ]; do
  if curl -fsS --max-time 5 "$health_url" >/dev/null 2>&1; then
    docker compose ps etfsp
    exit 0
  fi
  sleep 2
  attempt=$((attempt + 1))
done

echo "Erro: o serviço etfsp não respondeu ao smoke test." >&2
docker compose logs --tail=100 etfsp >&2 || true
exit 1
REMOTE_SCRIPT
}

echo "Enviando etfsp:$version e etfsp:latest para $remote..."
docker save "etfsp:$version" etfsp:latest |
  zstd -T8 -5 |
  pv -W |
  ssh "$remote" docker load

echo "Recriando o serviço etfsp e executando o smoke test..."
if activate_remote activate; then
  echo "Deploy concluído com sucesso."
  exit 0
fi

echo "A ativação falhou; restaurando a imagem anterior..." >&2
if activate_remote rollback "$previous_image"; then
  echo "Rollback concluído. A imagem nova permaneceu carregada, mas não está ativa." >&2
else
  echo "Erro crítico: o rollback automático também falhou. Verifique a VPS imediatamente." >&2
fi
exit 1
