# syntax=docker/dockerfile:1

FROM node:20-slim AS deps
WORKDIR /usr/src/app

COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force

FROM node:20-slim AS runtime
WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        python3-venv \
        build-essential \
        openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY api/src ./src
COPY api/index.js ./
COPY api/scripts ./scripts
COPY runner /usr/src/runner

ENV RUNNER_PATH=/usr/src/runner/run.py

EXPOSE 3000

CMD ["node", "src/server.js"]
