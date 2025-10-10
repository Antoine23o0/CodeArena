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

Des fichiers d’exemple sont fournis (`api/.env.example`, `web/.env.example` et `.env.example` à la racine pour Docker). Copiez-les puis ajustez les valeurs selon votre environnement :

```bash
cp api/.env.example api/.env
cp web/.env.example web/.env
cp .env.example .env
```

Valeurs par défaut proposées :

- **Backend** : `MONGO_URI` pointe vers une instance locale (ou via Docker avec les identifiants `root/rootpassword`), `JWT_SECRET` doit être remplacé par un secret fort, `ALLOWED_ORIGINS` répertorie les origines autorisées (ajoutez `http://195.15.242.237:5173` pour la VM) et `RUNNER_PATH` indique où se trouve `runner/run.py`.
- **Frontend** : `VITE_API_URL` cible l’API et `VITE_SOCKET_URL` la passerelle Socket.IO. En production sur la VM, remplacez `localhost` par `http://195.15.242.237` ou laissez les valeurs relatives (`/api`) si vous servez tout via Docker.
- **Docker compose** : `.env` contrôle les bindings de ports et les URLs publiques diffusées aux conteneurs (`PUBLIC_HOST`, `PUBLIC_WEB_ORIGIN`, `PUBLIC_API_URL`, `PUBLIC_SOCKET_URL`, etc.). Les valeurs par défaut n’exposent que le frontend ; l’API et MongoDB restent jointes via le réseau interne. Sur la VM, réglez `PUBLIC_HOST=195.15.242.237` et ajustez uniquement `PUBLIC_WEB_ORIGIN`/`WEB_PORT` si nécessaire.

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

Le frontend est disponible sur `http://localhost:5173` (ou depuis l’adresse IP publique de la machine hôte), l’API REST sur `http://localhost:3000/api` et le flux Socket.IO sur `http://localhost:3000`.

### 4. Peupler la base avec des concours d'exemple

Une fois MongoDB opérationnel, l'API charge automatiquement les dix concours thématiques si
`AUTO_SEED_CONTESTS` (voir `api/.env`) n'est pas positionné à `false`. Pour relancer le peuplement
manuellement ou mettre à jour les données après modification des seeds, utilisez la commande suivante :

```bash
cd api
npm run seed:contests
```

Le script met à jour les concours déjà présents en se basant sur le titre et ajuste automatiquement leur statut (`scheduled`, `running`, `finished`) en fonction des dates. Chaque concours est décrit en français et porte un niveau (`Niveau 1` à `Niveau 10`) permettant de progresser des défis les plus accessibles jusqu'à la finale « Légende ». Deux problèmes sont créés ou synchronisés par concours, chacun avec ses cas de test publics/privés pour permettre aux participants de soumettre une solution immédiatement.

## Lancer la stack avec Docker

Prérequis : Docker Engine, `docker compose` et le port `5173` libre (ainsi que `8081` si vous décidez d’exposer Mongo Express).

1. Configurez la racine `.env` selon votre contexte (développement local ou VM). Pour la VM fournie par le professeur :

   ```dotenv
   PUBLIC_HOST=195.15.242.237
   PUBLIC_WEB_ORIGIN=http://195.15.242.237:5173
   PUBLIC_API_URL=/api
   PUBLIC_SOCKET_URL=
   WEB_BIND_HOST=0.0.0.0
   WEB_PORT=5173
   MONGO_EXPRESS_BIND_HOST=195.15.242.237 # Facultatif : expose Mongo Express publiquement
   ```

2. Lancez la stack :

   ```bash
   docker compose up --build
   ```

Les ports exposés sont configurés pour répondre aux contraintes suivantes :

| Service              | Conteneur        | Binding hôte      | Description |
|----------------------|------------------|-------------------|-------------|
| Frontend (Nginx)     | `web`            | `${WEB_BIND_HOST:-0.0.0.0}:${WEB_PORT:-5173}` → 80 | Site statique construit par Vite puis servi via Nginx. |
| API + Socket.IO      | `api`            | _Non exposé (réseau interne)_ | Rejoint par Nginx depuis le service `web` (proxy `/api` et `/socket.io`). |
| MongoDB              | `mongo`          | _Non exposé (réseau interne)_ | Accessible uniquement par les autres conteneurs (API, Mongo Express). |
| Mongo Express (UI)   | `mongo-express`  | `${MONGO_EXPRESS_BIND_HOST:-127.0.0.1}:${MONGO_EXPRESS_PORT:-8081}`   | Interface d’administration Mongo, à exposer uniquement si nécessaire. |

Le service `web` agit également comme reverse-proxy : toutes les requêtes HTTP/S sur `/api` et
`/socket.io` sont relayées vers le backend `api`. Depuis l’extérieur, l’API est donc joignable via la
même URL que le frontend (ex. `http://195.15.242.237:5173/api`).

Les entrées `PUBLIC_*` du fichier `.env` sont transmises aux conteneurs : `PUBLIC_WEB_ORIGIN` alimente
`ALLOWED_ORIGINS` côté API, tandis que `PUBLIC_API_URL` et `PUBLIC_SOCKET_URL` sont injectées comme
arguments de build Vite. Après toute modification de ces variables, relancez `docker compose build web`
ou `docker compose up --build` pour générer à nouveau le bundle statique avec les bonnes URLs publiques.

Après le démarrage, `docker compose ps` affiche directement les noms des services (`mongo`, `mongo-express`, `api`, `web`) au lieu d’adresses IP, ce qui facilite le suivi des conteneurs actifs. Dans cet environnement d’évaluation, Docker n’est pas disponible (`bash: command not found: docker`) ; exécutez cette commande sur une machine équipée de Docker.

> ℹ️ Les images Docker ont été allégées : l’API utilise désormais `node:20-slim` avec uniquement les dépendances système nécessaires (Python, GCC, OpenJDK) pour le runner, tandis que le frontend est compilé en bundle statique servi par `nginx:alpine`.

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

## Intégration continue

Le workflow GitHub Actions [`CI`](.github/workflows/ci.yml) vérifie automatiquement le projet à chaque push/PR sur `main` et `dev` :

- **Backend** : installation des dépendances puis exécution de la suite d’intégration contre un MongoDB de test.
- **Frontend** : linting et construction du client React.
- **Runner** : compilation statique des scripts Python.
- **Smoke test Docker** : `docker compose up --build -d` lance la stack complète, les jobs patientent jusqu’à ce que l’API (`http://127.0.0.1:3000/api/contests`) et le frontend (`http://127.0.0.1:5173`) répondent, puis démontent les conteneurs.

Cette étape remplace l’exécution manuelle de `docker compose up --build` et garantit que la pile peut démarrer sur l’infrastructure CI.

## Contributions

1. Créez une branche à partir de `dev`.
2. Ajoutez vos modifications + tests.
3. Soumettez une Pull Request détaillant les évolutions (backend, runner, frontend).
