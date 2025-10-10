FROM node:18

WORKDIR /usr/src/app

COPY api/package*.json ./
RUN npm install --quiet

COPY api/. ./
COPY runner /usr/src/runner

ENV RUNNER_PATH=/usr/src/runner/run.py

EXPOSE 3000

<<<<<<< HEAD
CMD ["node", "src/index.js"]
=======
CMD ["node", "src/server.js"]
>>>>>>> origin/codex/review-project-and-provide-feedback-kmcakh
