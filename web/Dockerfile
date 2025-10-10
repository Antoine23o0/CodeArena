# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci \
    && npm cache clean --force

COPY . .

ARG VITE_API_URL=/api
ARG VITE_SOCKET_URL=
ARG VITE_API_FALLBACK_PORT=3000
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_API_FALLBACK_PORT=$VITE_API_FALLBACK_PORT
RUN npm run build

FROM nginx:alpine AS runtime
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
