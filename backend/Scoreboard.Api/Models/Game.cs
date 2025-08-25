using System.Text.Json.Serialization;

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
        public string Status { get; set; } = "running"; 
        public List<ScoreEvent> Events { get; set; } = new();
    }

    public class ScoreEvent
    {
        public int Id { get; set; }
        public int GameId { get; set; }

        [JsonIgnore] 
        public Game? Game { get; set; }

        public string Team { get; set; } = "home";
        public int Points { get; set; }
        public DateTimeOffset At { get; set; } = DateTimeOffset.UtcNow;
        public string Type { get; set; } = "score"; 
    }
}