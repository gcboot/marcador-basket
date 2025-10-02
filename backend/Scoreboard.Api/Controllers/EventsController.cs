using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Scoreboard.Api.Data;
using Scoreboard.Api.Models;

namespace Scoreboard.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 🔒 requiere token
    public class EventsController : ControllerBase
    {
        private readonly AppDb _db;

        public EventsController(AppDb db)
        {
            _db = db;
        }

        // 📌 POST /api/events/score
        [HttpPost("score")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AddScore([FromBody] ScoreEvent req)
        {
            var game = await _db.Games.FindAsync(req.GameId);
            if (game == null) return NotFound("Juego no encontrado");

            if (req.TeamId == game.HomeTeamId)
                game.HomeScore += req.Points;
            else if (req.TeamId == game.AwayTeamId)
                game.AwayScore += req.Points;
            else
                return BadRequest("El TeamId no pertenece al juego");

            req.EventType = "score";
            req.At = DateTimeOffset.UtcNow;

            _db.Events.Add(req);
            await _db.SaveChangesAsync();

            return Ok(game);
        }

        // 📌 POST /api/events/foul
        [HttpPost("foul")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AddFoul([FromBody] ScoreEvent req)
        {
            var game = await _db.Games.FindAsync(req.GameId);
            if (game == null) return NotFound("Juego no encontrado");

            if (req.TeamId == game.HomeTeamId) game.HomeFouls++;
            else if (req.TeamId == game.AwayTeamId) game.AwayFouls++;
            else return BadRequest("El TeamId no pertenece al juego");

            req.EventType = "foul";
            req.Points = 0; // ⚠️ o -1 si quieres penalizar
            req.At = DateTimeOffset.UtcNow;

            _db.Events.Add(req);
            await _db.SaveChangesAsync();

            return Ok(game);
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
