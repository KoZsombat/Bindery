FROM node:24-alpine

# pdftotext is used only when a user uploads a PDF.
RUN apk add --no-cache poppler-utils

WORKDIR /app
COPY platform ./platform
COPY skills ./skills
COPY examples/matekbazis ./examples/matekbazis

ENV NODE_ENV=production \
    PORT=8080 \
    DATA_DIR=/data \
    SKILL_PATH=/app/skills/learning-book-site/SKILL.md \
    EXAMPLE_DIR=/app/examples/matekbazis

RUN mkdir -p /data
VOLUME ["/data"]
EXPOSE 8080
CMD ["node", "platform/server.js"]
