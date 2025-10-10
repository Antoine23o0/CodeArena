# CodeArena

Plateforme de compétition de code en temps réel permettant de :

- gérer l’authentification JWT des participants ;
- orchestrer des concours avec listes de problèmes, inscription et classement dynamique ;
- évaluer des soumissions Python ou JavaScript dans un bac à sable isolé (processus dédié) ;
- diffuser les mises à jour de scoreboards via WebSockets (Socket.IO) au frontend React.

Le travail en cours se déroule sur la branche `dev`.

## Architecture

- **api/** – backend Node.js/Express connecté à MongoDB, expose les routes REST et les événements Socket.IO.
- **runner/** – service Python qui exécute le code soumis en testant chaque cas de test sous contrainte de temps.
- **web/** – frontend React (Vite + Tailwind) consommant l’API, affichant concours, éditeur et classements.

## Démarrage rapide (hors Docker)

### 1. Dépendances

```bash
cd api && npm install
cd ../web && npm install
```

### 2. Variables d’environnement principales

Backend (`api/.env` recommandé) :

```bash
MONGO_URI=mongodb://localhost:27017/codearena
JWT_SECRET=change-me
ALLOWED_ORIGINS=http://localhost:5173
RUNNER_PATH=../runner/run.py
```

Frontend (`web/.env`) :

```bash
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### 3. Lancer les services

MongoDB doit être accessible localement (ou via `docker compose`, voir ci-dessous).

```bash
# Terminal 1 – backend + websockets
cd api
npm run dev

# Terminal 2 – frontend React
cd web
npm run dev
```

Le frontend est disponible sur `http://localhost:5173`, l’API sur `http://localhost:3000/api` et le flux Socket.IO sur `http://localhost:3000`.

### 4. Peupler la base avec des concours d'exemple

Une fois MongoDB opérationnel, vous pouvez injecter dix concours thématiques prêts à l'emploi pour tester le parcours complet :

```bash
cd api
npm run seed:contests
```

Le script met à jour les concours déjà présents en se basant sur le titre et ajuste automatiquement leur statut (`scheduled`, `running`, `finished`) en fonction des dates.

## Lancer la stack avec Docker

Prérequis : Docker Engine, `docker compose` et les ports `27017`, `3000`, `5173`, `8081` libres.

```bash
docker compose up --build
```

Cette commande construit les services `api` (Express + Socket.IO), `web` (Vite) et `runner`, démarre MongoDB ainsi que Mongo Express. Dans cet environnement d’évaluation, Docker n’est pas disponible (`bash: command not found: docker`) ; exécutez cette commande sur une machine équipée de Docker.

## Fonctionnalités clés

- **Auth & profils** : inscription/connexion, récupération du profil via token.
- **Concours** : création, statut automatique (planifié, en cours, terminé), inscription des participants, liste des problèmes et scores agrégés.
- **Problèmes** : gestion de cas de test publics/privés, barème configurable, limites de temps/mémoire.
- **Soumissions** : évaluation sandbox (Python/Java/C) avec rapport détaillé (stdout/stderr, temps total, résultat par test).
- **Scoreboards** : calcul du meilleur score par problème, classement contestuel + global, diffusion temps réel via Socket.IO (`scoreboard:subscribe`).
- **Frontend** : éditeur minimal intégré, historique personnel, vues concours/scoreboards synchronisées en direct.

## Tests

Aucun test automatique n’a encore été ajouté. Le runner Python peut être invoqué directement :

```bash
echo '{"language":"python","code":"print(1)","testCases":[{"input":"","expectedOutput":"1"}]}' | python3 runner/run.py
```

Adaptez `language` à `java` ou `c` et fournissez un code compatible (`Main` pour Java, fonction `main` pour C) pour tester les autres environnements.

## Contributions

1. Créez une branche à partir de `dev`.
2. Ajoutez vos modifications + tests.
3. Soumettez une Pull Request détaillant les évolutions (backend, runner, frontend).
