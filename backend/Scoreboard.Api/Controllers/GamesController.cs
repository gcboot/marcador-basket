using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Scoreboard.Api.Data;
using Scoreboard.Api.Hubs;
using Scoreboard.Api.Models;

namespace Scoreboard.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 🔒 requiere token
    public class GamesController : ControllerBase
    {
        private readonly AppDb _db;
        private readonly IHubContext<GameHub> _hub;

        public GamesController(AppDb db, IHubContext<GameHub> hub)
        {
            _db = db;
            _hub = hub;
        }

        // 📌 GET /api/games
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetGames()
        {
            var games = await _db.Games
                .Include(g => g.HomeTeam)
                .Include(g => g.AwayTeam)
                .OrderByDescending(g => g.Id)
                .ToListAsync();

            return Ok(games);
        }

        // 📌 GET /api/games/{id}
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetGame(int id)
        {
            var game = await _db.Games
                .Include(g => g.HomeTeam)
                .Include(g => g.AwayTeam)
                .Include(g => g.Events)
                    .ThenInclude(e => e.Player)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (game == null) return NotFound();
            return Ok(game);
        }

        // 📌 POST /api/games
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateGame([FromBody] Game game)
        {
            if (game.HomeTeamId == 0 || game.AwayTeamId == 0)
                return BadRequest("Debes especificar equipos local y visitante");

            if (!await _db.Teams.AnyAsync(t => t.Id == game.HomeTeamId) ||
                !await _db.Teams.AnyAsync(t => t.Id == game.AwayTeamId))
                return BadRequest("Alguno de los equipos no existe");

            game.StartedAt = DateTimeOffset.UtcNow;
            game.Status = "paused";

            _db.Games.Add(game);
            await _db.SaveChangesAsync();

            await _hub.Clients.All.SendAsync("GameCreated", game);

            return CreatedAtAction(nameof(GetGame), new { id = game.Id }, game);
        }

        // 📌 PUT /api/games/{id}
        [HttpPut("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateGame(int id, [FromBody] Game game)
        {
            if (id != game.Id) return BadRequest();

            var existing = await _db.Games.FindAsync(id);
            if (existing == null) return NotFound();

            existing.HomeTeamId = game.HomeTeamId;
            existing.AwayTeamId = game.AwayTeamId;
            existing.Status = game.Status;
            existing.Quarter = game.Quarter;
            existing.HomeScore = game.HomeScore;
            existing.AwayScore = game.AwayScore;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // 📌 DELETE /api/games/{id}
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteGame(int id)
        {
            var game = await _db.Games.FindAsync(id);
            if (game == null) return NotFound();

            _db.Games.Remove(game);
            await _db.SaveChangesAsync();

            await _hub.Clients.All.SendAsync("GameDeleted", id);

            return NoContent();
        }

        // 📌 POST /api/games/{id}/quarter/next
        [HttpPost("{id:int}/quarter/next")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> NextQuarter(int id)
        {
            var g = await _db.Games.FindAsync(id);
            if (g == null) return NotFound();

            if (g.Quarter < 4) g.Quarter++;

            await _db.SaveChangesAsync();

            await _hub.Clients.Group($"game-{id}")
                .SendAsync("QuarterUpdated", g.Quarter);

            return Ok(g);
        }

        // 📌 POST /api/games/{id}/finish?status={status}
        [HttpPost("{id:int}/finish")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> FinishGame(int id, [FromQuery] string status)
        {
            var g = await _db.Games.FindAsync(id);
            if (g == null) return NotFound();

            var allowed = new[] { "running", "paused", "finished", "canceled", "suspended" };
            if (!allowed.Contains(status))
                return BadRequest("status debe ser running|paused|finished|canceled|suspended");

            g.Status = status;

            if (status is "finished" or "canceled" or "suspended")
                g.EndedAt = DateTimeOffset.UtcNow;
            else
                g.EndedAt = null;

            await _db.SaveChangesAsync();

            await _hub.Clients.Group($"game-{id}")
                .SendAsync("GameStatusUpdated", new { g.Id, g.Status, g.EndedAt });

            return Ok(g);
        }
    }
}
