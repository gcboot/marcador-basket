namespace Scoreboard.Api.Models
{
    public class Game
    {
        public int Id { get; set; }
        public DateTimeOffset StartedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? EndedAt { get; set; }
        public int Quarter { get; set; } = 1;
        public int HomeScore { get; set; }
        public int AwayScore { get; set; }
        public int HomeFouls { get; set; }
        public int AwayFouls { get; set; }
        public string Status { get; set; } = "paused";

        // 🔑 Llaves foráneas a Teams
        public int HomeTeamId { get; set; }
        public Team? HomeTeam { get; set; }

        public int AwayTeamId { get; set; }
        public Team? AwayTeam { get; set; }

        // Relación con eventos
        public List<ScoreEvent> Events { get; set; } = new();
    }

    public class ScoreEvent
    {
        public int Id { get; set; }
        public int GameId { get; set; }
        public Game? Game { get; set; }

        // 🔑 Referencia al equipo
        public int TeamId { get; set; }
        public Team? Team { get; set; }

        // 🔑 Referencia opcional al jugador
        public int? PlayerId { get; set; }
        public Player? Player { get; set; }

        public string EventType { get; set; } = "score"; // score o foul
        public int Points { get; set; }
        public DateTimeOffset At { get; set; } = DateTimeOffset.UtcNow;
    }
}
