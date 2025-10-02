namespace Scoreboard.Api.Models.DTOs
{
    public class CreateUsuarioRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Rol { get; set; } = "user";
    }
}
