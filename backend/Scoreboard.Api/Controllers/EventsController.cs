using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Scoreboard.Api.Data;
using Scoreboard.Api.Models;
using Scoreboard.Api.Hubs;
using Scoreboard.Api.Models.DTOs;

namespace Scoreboard.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EventsController : ControllerBase
    {
        private readonly AppDb _db;
        private readonly IHubContext<GameHub> _hub;

        public EventsController(AppDb db, IHubContext<GameHub> hub)
        {
            _db = db;
            _hub = hub;
        }

        // 📌 POST /api/events/score
        [HttpPost("score")]
        public async Task<IActionResult> AddScore([FromBody] CreateScoreEventDto req)
        {
            if (req == null) return BadRequest("Evento inválido");

            var game = await _db.Games.FindAsync(req.GameId);
            if (game == null) return NotFound("Juego no encontrado");

            // 🔹 Actualizar marcador según el equipo
            if (req.TeamId == game.HomeTeamId)
                game.HomeScore += req.Points;
            else if (req.TeamId == game.AwayTeamId)
                game.AwayScore += req.Points;
            else
                return BadRequest("El TeamId no pertenece al juego");

            // 🔹 Crear registro de evento
            var ev = new ScoreEvent
            {
                GameId = req.GameId,
                TeamId = req.TeamId,
                PlayerId = req.PlayerId,
                Points = req.Points,
                EventType = "score",
                At = DateTimeOffset.UtcNow
            };

            _db.Events.Add(ev);
            await _db.SaveChangesAsync();

            // 🔹 Cargar juego actualizado con relaciones
            var updated = await _db.Games
                .Include(x => x.HomeTeam)!.ThenInclude(t => t.Players)
                .Include(x => x.AwayTeam)!.ThenInclude(t => t.Players)
                .Include(x => x.Events).ThenInclude(e => e.Player)
                .FirstOrDefaultAsync(x => x.Id == game.Id);

            if (updated == null) return NotFound("Juego no encontrado tras actualizar");

            // 🔹 Emitir actualización a todos los clientes
            await _hub.Clients.All.SendAsync("ScoreUpdated", updated);

            return Ok(updated);
        }

        // 📌 POST /api/events/foul
        [HttpPost("foul")]
        public async Task<IActionResult> AddFoul([FromBody] CreateScoreEventDto req)
        {
            if (req == null) return BadRequest("Evento inválido");

            var game = await _db.Games.FindAsync(req.GameId);
            if (game == null) return NotFound("Juego no encontrado");

            // 🔹 Incrementar faltas
            if (req.TeamId == game.HomeTeamId)
                game.HomeFouls++;
            else if (req.TeamId == game.AwayTeamId)
                game.AwayFouls++;
            else
                return BadRequest("El TeamId no pertenece al juego");

            // 🔹 Registrar evento
            var ev = new ScoreEvent
            {
                GameId = req.GameId,
                TeamId = req.TeamId,
                PlayerId = req.PlayerId,
                Points = 0,
                EventType = "foul",
                At = DateTimeOffset.UtcNow
            };

            _db.Events.Add(ev);
            await _db.SaveChangesAsync();

            // 🔹 Cargar juego actualizado
            var updated = await _db.Games
                .Include(x => x.HomeTeam)!.ThenInclude(t => t.Players)
                .Include(x => x.AwayTeam)!.ThenInclude(t => t.Players)
                .Include(x => x.Events).ThenInclude(e => e.Player)
                .FirstOrDefaultAsync(x => x.Id == game.Id);

            if (updated == null) return NotFound("Juego no encontrado tras actualizar");

            await _hub.Clients.All.SendAsync("ScoreUpdated", updated);

            return Ok(updated);
        }

        // 📌 GET /api/events/game/{gameId}
        [HttpGet("game/{gameId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetEventsByGame(int gameId)
        {
            var events = await _db.Events
                .Include(e => e.Player)
                .Include(e => e.Team)
                .Where(e => e.GameId == gameId)
                .OrderBy(e => e.At)
                .ToListAsync();

            return Ok(events);
        }
    }
}
