# Etapa de build Angular
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Etapa de Nginx
FROM nginx:alpine
COPY --from=build /app/dist/scoreboard/browser /usr/share/nginx/html
EXPOSE 80
