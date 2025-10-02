namespace Scoreboard.Api.Models.DTOs
{
    public class CreateGameRequest
    {
        public int HomeTeamId { get; set; }
        public int AwayTeamId { get; set; }
    }
}
