#!/usr/bin/env bash
set -euo pipefail

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
test_dir=$(mktemp -d /tmp/etfsp-deploy-test-XXXXXX)
fake_bin="$test_dir/bin"
log_file="$test_dir/ssh.log"

cleanup() {
  rm -rf -- "$test_dir"
}
trap cleanup EXIT HUP INT TERM

mkdir -p "$fake_bin"

cat >"$fake_bin/docker" <<'FAKE_DOCKER'
#!/usr/bin/env bash
set -eu
if [ "${1:-}" = save ]; then
  printf 'imagem-ficticia'
  exit 0
fi
exit 2
FAKE_DOCKER

cat >"$fake_bin/zstd" <<'FAKE_ZSTD'
#!/usr/bin/env bash
cat
FAKE_ZSTD

cat >"$fake_bin/pv" <<'FAKE_PV'
#!/usr/bin/env bash
cat
FAKE_PV

cat >"$fake_bin/ssh" <<'FAKE_SSH'
#!/usr/bin/env bash
set -eu
shift

case "${1:-}" in
  "docker image ls"*)
    printf '%s\n' 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    ;;
  docker)
    cat >/dev/null
    printf '%s\n' 'imagem carregada'
    ;;
  sh)
    cat >/dev/null
    mode=${6:-}
    printf '%s\n' "$mode" >>"$FAKE_SSH_LOG"
    if [ "$mode" = activate ] && [ "${FAKE_ACTIVATION_FAIL:-0}" = 1 ]; then
      exit 1
    fi
    ;;
  *)
    exit 2
    ;;
esac
FAKE_SSH

chmod +x "$fake_bin/docker" "$fake_bin/pv" "$fake_bin/ssh" "$fake_bin/zstd"

cd "$repo_root"

PATH="$fake_bin:$PATH" \
  FAKE_SSH_LOG="$log_file" \
  ./deploy/send_container.sh servidor-ficticio >/dev/null

if [ "$(cat "$log_file")" != activate ]; then
  echo "Erro: o caminho de sucesso não ativou a imagem uma única vez." >&2
  exit 1
fi

: >"$log_file"
set +e
PATH="$fake_bin:$PATH" \
  FAKE_SSH_LOG="$log_file" \
  FAKE_ACTIVATION_FAIL=1 \
  ./deploy/send_container.sh servidor-ficticio >/dev/null 2>&1
status=$?
set -e

if [ "$status" -eq 0 ]; then
  echo "Erro: uma ativação com falha não pode retornar sucesso." >&2
  exit 1
fi

if [ "$(cat "$log_file")" != "activate
rollback" ]; then
  echo "Erro: a falha de ativação não acionou o rollback." >&2
  exit 1
fi

echo "Teste do deploy concluído com sucesso."
