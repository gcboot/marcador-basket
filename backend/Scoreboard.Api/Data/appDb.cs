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
            // Game → HomeTeam (no queremos borrar el equipo si se borra un juego)
            modelBuilder.Entity<Game>()
                .HasOne(g => g.HomeTeam)
                .WithMany()
                .HasForeignKey(g => g.HomeTeamId)
                .OnDelete(DeleteBehavior.Restrict);

            // Game → AwayTeam (igual que arriba)
            modelBuilder.Entity<Game>()
                .HasOne(g => g.AwayTeam)
                .WithMany()
                .HasForeignKey(g => g.AwayTeamId)
                .OnDelete(DeleteBehavior.Restrict);

            // Player → Team (si borras un equipo, se borran los jugadores)
            modelBuilder.Entity<Player>()
                .HasOne(p => p.Team)
                .WithMany(t => t.Players)
                .HasForeignKey(p => p.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // ScoreEvent → Game (si borras un juego, se borran sus eventos)
            modelBuilder.Entity<ScoreEvent>()
                .HasOne(e => e.Game)
                .WithMany(g => g.Events)
                .HasForeignKey(e => e.GameId)
                .OnDelete(DeleteBehavior.Cascade);

            // ScoreEvent → Team (si borras un equipo, se borran eventos ligados a ese equipo)
            modelBuilder.Entity<ScoreEvent>()
                .HasOne(e => e.Team)
                .WithMany()
                .HasForeignKey(e => e.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // ScoreEvent → Player (si borras un jugador, sus eventos quedan huérfanos → Restrict)
            modelBuilder.Entity<ScoreEvent>()
                .HasOne(e => e.Player)
                .WithMany()
                .HasForeignKey(e => e.PlayerId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
