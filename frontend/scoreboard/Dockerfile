# Etapa 1: build Angular
FROM node:22-alpine AS build
WORKDIR /app

# Copiar e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Build en modo producción
RUN npm run build -- --configuration production

# Etapa 2: servir con Nginx
FROM nginx:alpine

# Copiar archivos compilados al contenedor Nginx
COPY --from=build /app/dist/scoreboard/browser /usr/share/nginx/html

# Configuración de Nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
