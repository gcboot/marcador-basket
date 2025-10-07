public class CreateScoreEventDto
{
    public int GameId { get; set; }
    public int TeamId { get; set; }
    public int? PlayerId { get; set; }
    public int Points { get; set; }
}
