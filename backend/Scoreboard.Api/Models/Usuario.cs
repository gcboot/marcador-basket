namespace Scoreboard.Api.Models
{
    public class Usuario
    {
        public int Id { get; set; }

        // Nombre único de usuario
        public string Username { get; set; } = string.Empty;

        // Hash de la contraseña (BCrypt)
        public string PasswordHash { get; set; } = string.Empty;

        // Rol del usuario (admin, user, etc.)
        public string Rol { get; set; } = "user";
    }
}
