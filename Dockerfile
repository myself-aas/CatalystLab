# syntax=docker/dockerfile:1.7
# CatalystLab API + SSR Prerender Host Image (Plan item 5.1, D3(b), D5, Q32)
# Multi-stage Node 24 Bookworm Slim container with non-root `node` runtime user,
# zero devDependencies in final layer, and native /api/v1/system/health probe.

FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG APP_ORIGIN=https://www.catalystlab.tech
ARG VITE_APP_ORIGIN=https://www.catalystlab.tech
ENV NODE_ENV=production \
    APP_ORIGIN=${APP_ORIGIN} \
    VITE_APP_ORIGIN=${VITE_APP_ORIGIN}

RUN npm run build && npm run check:bundle

FROM node:24-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    PAYMENTS_ENABLED=false \
    ALLOW_UNAUTH_DEMO=false

COPY package.json package-lock.json .env.example .env.staging.example .env.production.example ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/v1/system/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.cjs"]
