FROM node:23-alpine AS build
ADD . /app/
WORKDIR /app
RUN corepack enable pnpm
RUN pnpm i
RUN pnpm run build

FROM node:23-alpine
COPY --from=build /app/build /app/package.json /app/pnpm-lock.yaml /app/
# ADD build /app/build
# ADD package.json /app
# ADD pnpm-lock.yaml /app
WORKDIR /app
RUN corepack enable pnpm
RUN pnpm i -P
ENTRYPOINT [ "node", "./build" ]
