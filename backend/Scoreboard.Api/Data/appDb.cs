using Microsoft.EntityFrameworkCore;
using Scoreboard.Api.Models;

namespace Scoreboard.Api.Data
{
    public class AppDb : DbContext
    {
        public AppDb(DbContextOptions<AppDb> options) : base(options) { }

        public DbSet<Game> Games { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<ScoreEvent> Events { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Game → HomeTeam
            modelBuilder.Entity<Game>()
                .HasOne(g => g.HomeTeam)
                .WithMany()
                .HasForeignKey(g => g.HomeTeamId)
                .OnDelete(DeleteBehavior.Restrict);

            // Game → AwayTeam
            modelBuilder.Entity<Game>()
                .HasOne(g => g.AwayTeam)
                .WithMany()
                .HasForeignKey(g => g.AwayTeamId)
                .OnDelete(DeleteBehavior.Restrict);

            // Player → Team
            modelBuilder.Entity<Player>()
                .HasOne(p => p.Team)
                .WithMany(t => t.Players)
                .HasForeignKey(p => p.TeamId);

            // ScoreEvent → Game
            modelBuilder.Entity<ScoreEvent>()
                .HasOne(e => e.Game)
                .WithMany(g => g.Events)
                .HasForeignKey(e => e.GameId);

            // ScoreEvent → Team
            modelBuilder.Entity<ScoreEvent>()
                .HasOne(e => e.Team)
                .WithMany()
                .HasForeignKey(e => e.TeamId);

            // ScoreEvent → Player
            modelBuilder.Entity<ScoreEvent>()
                .HasOne(e => e.Player)
                .WithMany()
                .HasForeignKey(e => e.PlayerId);
        }
    }
}
