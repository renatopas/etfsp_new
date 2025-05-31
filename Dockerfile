FROM node:23-alpine AS build
ADD . /app/
WORKDIR /app
RUN corepack enable pnpm
RUN pnpm i
RUN pnpm run build

FROM node:23-alpine
COPY --from=build /app/build /app/build
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/pnpm-lock.yaml /app/pnpm-lock.yaml
WORKDIR /app
RUN corepack enable pnpm
RUN pnpm i -P
ENTRYPOINT [ "node", "/app/build" ]
