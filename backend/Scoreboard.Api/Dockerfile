# Etapa de build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["Scoreboard.Api/Scoreboard.Api.csproj", "Scoreboard.Api/"]
RUN dotnet restore "Scoreboard.Api/Scoreboard.Api.csproj"

COPY . .
WORKDIR "/src/Scoreboard.Api"
RUN dotnet build "Scoreboard.Api.csproj" -c Release -o /app/build
RUN dotnet publish "Scoreboard.Api.csproj" -c Release -o /app/publish

# Etapa de ejecución
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .


EXPOSE 8080


ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Scoreboard.Api.dll"]
