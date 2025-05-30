# set shell := ["bash", "-eux", "-o", "pipefail", "-c"]
ssh := "oracle"

run: fmt
  pnpm run dev

fmt:
  pnpm run format

build: fmt
  pnpm run build

build_docker: build
  docker build . -t etfsp:latest -t etfsp:$(jq -r .version < package.json)

send_container: build_docker
  docker save etfsp:latest | zstd -T8 -5 | pv | ssh {{ssh}} 'docker load'
