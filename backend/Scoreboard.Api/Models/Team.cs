namespace Scoreboard.Api.Models
{
    public class Team
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        // Relación con jugadores
        public List<Player> Players { get; set; } = new();
    }
}
