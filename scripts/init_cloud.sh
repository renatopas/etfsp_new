#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_dir"

corepack enable
pnpm install --frozen-lockfile

if [[ ! -e .cloud-data ]]; then
  pnpm run cloud:data:init
fi

pnpm run cloud:data:check
