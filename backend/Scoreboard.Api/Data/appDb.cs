using Microsoft.EntityFrameworkCore;
using Scoreboard.Api.Models;

namespace Scoreboard.Api.Data
{
    public class AppDb(DbContextOptions<AppDb> opts) : DbContext(opts)
    {
        public DbSet<Game> Games => Set<Game>();
        public DbSet<ScoreEvent> Events => Set<ScoreEvent>();

        protected override void OnModelCreating(ModelBuilder mb)
        {
            mb.Entity<Game>().HasMany(g => g.Events).WithOne(e => e.Game!).HasForeignKey(e => e.GameId);
        }
    }
}