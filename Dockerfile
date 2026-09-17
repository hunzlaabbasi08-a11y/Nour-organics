# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY server/package.json server/package-lock.json ./server/
COPY web/package.json web/package-lock.json ./web/
RUN npm --prefix server ci
RUN npm --prefix web ci

COPY server ./server
COPY web ./web

RUN npm --prefix web run build
RUN npm --prefix server run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/server/package.json /app/server/package-lock.json ./server/
RUN npm --prefix server ci --omit=dev

COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/sql ./server/sql
COPY --from=build /app/web/dist ./web/dist

WORKDIR /app/server
EXPOSE 3001
CMD ["node", "dist/index.js"]
