# Étape 1 : base Node plus légère
FROM node:18-alpine AS base

WORKDIR /usr/src/app

# Copier uniquement les fichiers nécessaires
COPY api/package*.json ./
RUN npm install --production --quiet

COPY api/ ./
COPY runner /usr/src/runner

ENV RUNNER_PATH=/usr/src/runner/run.py

EXPOSE 3000

CMD ["node", "src/server.js"]
