# syntax=docker/dockerfile:1

# ---- dependencies (build everything once) --------------------------------
FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY apps/client/package.json ./apps/client/package.json
RUN npm ci

# ---- client build --------------------------------------------------------
FROM deps AS build
COPY apps/client ./apps/client
RUN npm run build --workspace apps/client

# ---- production dependencies -------------------------------------------
FROM node:24-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY apps/client/package.json ./apps/client/package.json
RUN npm ci --omit=dev && npm cache clean --force

# ---- runtime -------------------------------------------------------------
FROM node:24-alpine AS runtime
RUN apk add --no-cache poppler-utils tini
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    DATA_DIR=/data \
    STATIC_DIR=/app/apps/client/dist

COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./
COPY apps/server ./apps/server
COPY --from=build /app/apps/client/dist ./apps/client/dist
COPY shared ./shared
COPY skills ./skills
COPY examples/matekbazis ./examples/matekbazis

# Forces a fresh runtime layer per build and proves which image is running.
RUN date -u +%FT%TZ > BUILD

RUN mkdir -p /data && chown -R node:node /data
USER node
VOLUME ["/data"]
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/readyz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/server/src/index.js"]
