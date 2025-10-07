# Image Node plus récente compatible Vite
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host pour que le conteneur soit accessible depuis l'extérieur
CMD ["npm", "run", "dev", "--", "--host"]
