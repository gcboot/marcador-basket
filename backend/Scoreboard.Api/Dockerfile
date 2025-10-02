# Etapa 1: build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "./Scoreboard.Api.csproj"
RUN dotnet publish "./Scoreboard.Api.csproj" -c Release -o /app/publish

# Etapa 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Instalar netcat para el wait-for-sql
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Copiar la API publicada
COPY --from=build /app/publish .

# Copiar el script
COPY wait-for-sql.sh /wait-for-sql.sh
RUN chmod +x /wait-for-sql.sh

EXPOSE 5071
EXPOSE 7100

ENTRYPOINT ["/wait-for-sql.sh", "dotnet", "Scoreboard.Api.dll"]
