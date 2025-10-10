# Étape 1 : build du front
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : image finale ultra-légère avec un serveur statique
FROM nginx:alpine

# Copier les fichiers buildés de la première étape
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
