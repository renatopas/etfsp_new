# set shell := ["bash", "-eux", "-o", "pipefail", "-c"]
ssh := "etfsp"

run: fmt
  pnpm run dev

fmt:
  pnpm run format

build: fmt
  pnpm run build

preview: build
  pnpm run preview

build_docker: fmt
  docker build . -t etfsp:latest -t etfsp:$(jq -r .version < package.json)

send_container: build_docker
  docker save etfsp:latest | zstd -T8 -5 | pv -W | ssh {{ssh}} 'docker load'
