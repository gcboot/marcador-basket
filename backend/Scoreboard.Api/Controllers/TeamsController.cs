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
    public class TeamsController : ControllerBase
    {
        private readonly AppDb _db;

        public TeamsController(AppDb db)
        {
            _db = db;
        }

        // 📌 GET /api/teams
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetTeams()
        {
            var teams = await _db.Teams
                .Include(t => t.Players)
                .AsNoTracking()
                .ToListAsync();
            return Ok(teams);
        }

        // 📌 GET /api/teams/{id}
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTeam(int id)
        {
            var team = await _db.Teams
                .Include(t => t.Players)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (team == null) return NotFound();
            return Ok(team);
        }

        // 📌 POST /api/teams
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateTeam([FromBody] Team team)
        {
            _db.Teams.Add(team);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team);
        }

        // 📌 PUT /api/teams/{id}
        [HttpPut("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateTeam(int id, [FromBody] Team team)
        {
            if (id != team.Id) return BadRequest();

            var exists = await _db.Teams.AnyAsync(t => t.Id == id);
            if (!exists) return NotFound();

            _db.Entry(team).State = EntityState.Modified;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // 📌 DELETE /api/teams/{id}
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteTeam(int id)
        {
            var team = await _db.Teams.FindAsync(id);
            if (team == null) return NotFound();

            _db.Teams.Remove(team);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
