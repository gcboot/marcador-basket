using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Scoreboard.Api.Data;
using Scoreboard.Api.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using Scoreboard.Api.Hubs;

var builder = WebApplication.CreateBuilder(args);

// ---------- Configuracion ----------
var cs = builder.Configuration.GetConnectionString("Sql")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__Sql");

var foulPenalty =
    (int?)builder.Configuration.GetValue<int?>("Scoring:FoulPenalty")
    ?? (int.TryParse(Environment.GetEnvironmentVariable("Scoring__FoulPenalty"), out var p) ? p : 1);

// ---------- Servicios ----------
builder.Services.AddDbContext<AppDb>(o => o.UseSqlServer(cs));
builder.Services.AddCors(o => o.AddDefaultPolicy(
    p => p.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()
));
builder.Services.AddSignalR();

builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Swagger (disponible en Desarrollo y Producción)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Scoreboard API", Version = "v1" });
});

// ---------- Constructor ----------
var app = builder.Build();

// ---------- Middleware ----------
app.UseCors();

// Swagger siempre disponible
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Scoreboard API v1");
    c.RoutePrefix = "swagger"; // accesible en /swagger
});

// ---------- SignalR ----------
app.MapHub<GameHub>("/hub/game");

// Comunicación en tiempo real con SignalR
app.MapGet("/api/games", async (AppDb db) =>
    await db.Games.AsNoTracking().OrderByDescending(g => g.Id).ToListAsync()
);

app.MapGet("/api/games/{id:int}", async (int id, AppDb db) =>
    await db.Games.Include(g => g.Events).FirstOrDefaultAsync(g => g.Id == id)
);

app.MapPost("/api/games", async (AppDb db, IHubContext<GameHub> hub) =>
{
    var g = new Game
    {
        Status = "running",
        StartedAt = DateTimeOffset.UtcNow
    };
    db.Games.Add(g);
    await db.SaveChangesAsync();

    await hub.Clients.All.SendAsync("GameCreated", g);

    return Results.Created($"/api/games/{g.Id}", g);
});

app.MapPost("/api/games/{id:int}/score", async (
    int id,
    [FromQuery] string team,
    [FromQuery] int points,
    AppDb db,
    IHubContext<GameHub> hub) =>
{
    if (points <= 0 || points > 3) return Results.BadRequest("points debe ser 1, 2 o 3");
    if (team != "home" && team != "away") return Results.BadRequest("team debe ser 'home' o 'away'");

    var g = await db.Games.FindAsync(id);
    if (g is null) return Results.NotFound();

    if (team == "home") g.HomeScore += points; else g.AwayScore += points;

    db.Events.Add(new ScoreEvent { GameId = id, Team = team, Points = points, Type = "score" });
    await db.SaveChangesAsync();

    await hub.Clients.Group($"game-{id}")
        .SendAsync("ScoreUpdated", new { g.Id, g.HomeScore, g.AwayScore });

    return Results.Ok(g);
});

app.MapPost("/api/games/{id:int}/foul", async (
    int id,
    [FromQuery] string team,
    AppDb db,
    IHubContext<GameHub> hub) =>
{
    if (team != "home" && team != "away") return Results.BadRequest("team debe ser 'home' o 'away'");

    var g = await db.Games.FindAsync(id);
    if (g is null) return Results.NotFound();

    if (team == "home") g.HomeFouls += 1; else g.AwayFouls += 1;

    if (foulPenalty > 0)
    {
        if (team == "home")
            g.HomeScore = Math.Max(0, g.HomeScore - foulPenalty);
        else
            g.AwayScore = Math.Max(0, g.AwayScore - foulPenalty);
    }

    var eventPoints = foulPenalty > 0 ? -foulPenalty : 0;
    db.Events.Add(new ScoreEvent { GameId = id, Team = team, Points = eventPoints, Type = "foul" });

    await db.SaveChangesAsync();

    await hub.Clients.Group($"game-{id}")
        .SendAsync("FoulUpdated", new { g.Id, g.HomeFouls, g.AwayFouls, g.HomeScore, g.AwayScore });

    return Results.Ok(g);
});

app.MapPost("/api/games/{id:int}/quarter/next", async (
    int id,
    AppDb db,
    IHubContext<GameHub> hub) =>
{
    var g = await db.Games.FindAsync(id);
    if (g is null) return Results.NotFound();
    if (g.Quarter < 4) g.Quarter += 1;

    await db.SaveChangesAsync();

    await hub.Clients.Group($"game-{id}")
        .SendAsync("QuarterUpdated", g.Quarter);

    return Results.Ok(g);
});

app.MapPost("/api/games/{id:int}/finish", async (
    int id,
    [FromQuery] string status,
    AppDb db,
    IHubContext<GameHub> hub) =>
{
    var g = await db.Games.FindAsync(id);
    if (g is null) return Results.NotFound();

    var allowed = new[] { "running", "paused", "finished", "canceled", "suspended" };
    if (!allowed.Contains(status))
        return Results.BadRequest("status debe ser running|paused|finished|canceled|suspended");

    g.Status = status;

    if (status is "finished" or "canceled" or "suspended")
        g.EndedAt = DateTimeOffset.UtcNow;
    else
        g.EndedAt = null;

    await db.SaveChangesAsync();

    await hub.Clients.Group($"game-{id}")
        .SendAsync("GameStatusUpdated", new { g.Id, g.Status, g.EndedAt });

    return Results.Ok(g);
});

// ---------- Ejecutar ----------
app.Run();
