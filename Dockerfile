FROM node:24-alpine AS build
ADD package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
WORKDIR /app
RUN corepack enable pnpm
RUN pnpm i
ADD . /app/
RUN pnpm run build

FROM node:24-alpine
COPY --from=build /app/build /app/build
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=build /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=build /app/static /app/static
WORKDIR /app
RUN corepack enable pnpm
RUN pnpm i -P
ENTRYPOINT [ "node", "/app/build" ]
