FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Scoreboard.Api.csproj", "./"]
RUN dotnet restore "./Scoreboard.Api.csproj"
COPY . .
RUN dotnet publish "./Scoreboard.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Scoreboard.Api.dll"]
