using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Scoreboard.Api.Data;
using Scoreboard.Api.Models;
using Scoreboard.Api.Models.DTOs;

namespace Scoreboard.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")] // 👈 solo admin puede listar/editar usuarios
    public class UsuariosController : ControllerBase
    {
        private readonly AppDb _context;

        public UsuariosController(AppDb context)
        {
            _context = context;
        }

        // GET: api/usuarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            return await _context.Usuarios.ToListAsync();
        }

        // GET: api/usuarios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound();
            return usuario;
        }

        // POST: api/usuarios
        [HttpPost]
        [AllowAnonymous] // 👈 opcional: permitir que cualquiera se registre
        public async Task<ActionResult<Usuario>> PostUsuario(CreateUsuarioRequest dto)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Username == dto.Username))
                return BadRequest("El usuario ya existe.");

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var usuario = new Usuario
            {
                Username = dto.Username,
                PasswordHash = hashedPassword,
                Rol = dto.Rol ?? "user"
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, usuario);
        }

        // PUT: api/usuarios/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUsuario(int id, Usuario usuario)
        {
            if (id != usuario.Id) return BadRequest();

            _context.Entry(usuario).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/usuarios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound();

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
