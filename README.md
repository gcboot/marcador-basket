# 🏀 Marcador de Básquet en Tiempo Real

Aplicación de **marcador de básquetbol** con soporte para **sincronización en múltiples pantallas** usando **SignalR**, **Angular** y **.NET 9**.  
El proyecto está preparado para correr tanto de manera local como dentro de **Docker**.

---

### 📦 Requisitos previos

Para correr el proyecto **sin Docker**, necesitas tener instalado:

- **Node.js 20+**
- **Angular CLI 20.1.3**
- **.NET SDK 9.0.301**
- **SQL Server 2022** (local o en contenedor)

Verifica versiones con:

```bash
ng version
dotnet --version
```
### Estructura del proyecto
marcador-basket/
├── backend/
│   └── Scoreboard.Api/
│       ├── Controllers/
│       ├── Data/
│       ├── Hubs/
│       ├── Models/
│       ├── Program.cs
│       ├── Scoreboard.Api.csproj
│       └── Dockerfile
│
├── frontend/
│   └── scoreboard/
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.ts
│       │   │   ├── app.html
│       │   │   ├── app.css
│       │   │   └── services/scoreboard.service.ts
│       │   └── environments/
│       │       ├── environment.ts
│       │       └── environment.prod.ts
│       ├── package.json
│       └── Dockerfile
│
├── docker-compose.yml
└── README.md

### Endpoints principales

1. POST /api/games → Crear nuevo juego

2. GET /api/games/{id} → Obtener estado de un juego

3. POST /api/games/{id}/score?team=home&points=2 → Registrar puntos

4. POST /api/games/{id}/foul?team=away → Registrar falta

4. POST /api/games/{id}/quarter/next → Pasar al siguiente cuarto

6 .POST /api/games/{id}/finish?status=paused → Cambiar estado (running, paused, finished, canceled, suspended)

### SignalR Hub

```bash
/hub/game
```
### Eventos emitidos:

- ScoreUpdated

- FoulUpdated

- QuarterUpdated

- GameStatusUpdated

- GameCreated

### 📌 Funcionalidades

- Iniciar un nuevo juego

- Registrar puntos y faltas

- Avanzar de cuarto automáticamente al acabar el tiempo

- Pausar, reanudar, finalizar, cancelar o suspender un juego

- Sincronización en tiempo real entre múltiples pantallas vía SignalR
  
# 📌 Configuración de entornos

- src/environments/environment.ts (desarrollo):

```ts
export const environment = {
  production: false,
  api: 'http://localhost:5071/api/games',
  hub: 'http://localhost:5071/hub/game'
};

```
- src/environments/environment.prod.ts (Produccion docker):
- 
```ts
export const environment = {
  production: false,
  api: 'http://api:8080/api/games',
  hub: 'http://api:8080/hub/game'
};

```
### Base de datos 

- Crear la base de datos marcadorbasket en SQL Server

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=123456" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest

```

### Migraciones EF core