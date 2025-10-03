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

        // 🔑 Llaves foráneas a Teams (obligatorias)
        public int HomeTeamId { get; set; }
        public Team HomeTeam { get; set; } = null!; 

        public int AwayTeamId { get; set; }
        public Team AwayTeam { get; set; } = null!;

        // Relación con eventos
        public List<ScoreEvent> Events { get; set; } = new();
    }

    public class ScoreEvent
    {
        public int Id { get; set; }

        // 🔑 Referencia al juego (obligatoria)
        public int GameId { get; set; }
        public Game Game { get; set; } = null!;

        // 🔑 Referencia al equipo (opcional, porque puede ser evento de sistema)
        public int? TeamId { get; set; }
        public Team? Team { get; set; }

        // 🔑 Referencia opcional al jugador
        public int? PlayerId { get; set; }
        public Player? Player { get; set; }

        // Tipo de evento (score, foul, quarter, finish, etc.)
        public string EventType { get; set; } = "score";

        // Puntos del evento (0 si es foul o evento de sistema)
        public int Points { get; set; }

        // Momento en que ocurrió
        public DateTimeOffset At { get; set; } = DateTimeOffset.UtcNow;
    }
}
