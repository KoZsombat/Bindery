FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-alpine
RUN apk add --no-cache poppler-utils
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY public ./public
COPY shared ./shared
COPY skills ./skills
COPY examples/matekbazis ./examples/matekbazis
COPY package.json ./

ENV NODE_ENV=production \
    PORT=8080 \
    DATA_DIR=/data \
    SKILL_PATH=/app/skills/learning-book-site/SKILL.md \
    EXAMPLE_DIR=/app/examples/matekbazis

RUN mkdir -p /data
VOLUME ["/data"]
EXPOSE 8080
CMD ["node", "src/index.js"]
