# CodeArena

Ce dépôt suit désormais les développements courants sur la branche `dev`.

## Lancer la stack Docker

Prérequis :

- Docker Engine et `docker compose`
- Ports libres : `27017`, `3000`, `5173` et `8081`

```bash
docker compose up --build
```

Cette commande construit les services `api` et `web`, puis démarre la base MongoDB et l’interface Mongo Express. Lors de nos essais dans cet environnement, la commande échoue car Docker n’est pas installé (`bash: command not found: docker`). Exécutez-la depuis une machine disposant de Docker pour lancer la stack.
