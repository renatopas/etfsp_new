FROM node:23-alpine
ADD build /app/build
ADD package.json /app
ADD pnpm-lock.yaml /app
WORKDIR /app
RUN corepack enable pnpm
RUN pnpm i -P
ENTRYPOINT [ "node", "./build" ]
