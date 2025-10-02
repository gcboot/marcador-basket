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
    public class PlayersController : ControllerBase
    {
        private readonly AppDb _db;

        public PlayersController(AppDb db)
        {
            _db = db;
        }

        // 📌 GET /api/players
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPlayers()
        {
            var players = await _db.Players
                .Include(p => p.Team)
                .AsNoTracking()
                .ToListAsync();

            return Ok(players);
        }

        // 📌 GET /api/players/{id}
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPlayer(int id)
        {
            var player = await _db.Players
                .Include(p => p.Team)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (player == null) return NotFound();
            return Ok(player);
        }

        // 📌 GET /api/players/team/{teamId}
        [HttpGet("team/{teamId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPlayersByTeam(int teamId)
        {
            var players = await _db.Players
                .Where(p => p.TeamId == teamId)
                .AsNoTracking()
                .ToListAsync();

            return Ok(players);
        }

        // 📌 POST /api/players
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreatePlayer([FromBody] Player player)
        {
            // Validar que el equipo exista
            var teamExists = await _db.Teams.AnyAsync(t => t.Id == player.TeamId);
            if (!teamExists) return BadRequest("El equipo no existe.");

            _db.Players.Add(player);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlayer), new { id = player.Id }, player);
        }

        // 📌 PUT /api/players/{id}
        [HttpPut("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdatePlayer(int id, [FromBody] Player player)
        {
            if (id != player.Id) return BadRequest();

            var exists = await _db.Players.AnyAsync(p => p.Id == id);
            if (!exists) return NotFound();

            _db.Entry(player).State = EntityState.Modified;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // 📌 DELETE /api/players/{id}
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeletePlayer(int id)
        {
            var player = await _db.Players.FindAsync(id);
            if (player == null) return NotFound();

            _db.Players.Remove(player);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
