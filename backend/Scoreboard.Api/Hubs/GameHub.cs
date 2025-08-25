using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace Scoreboard.Api.Hubs
{
    public class GameHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            Console.WriteLine($"✅ Cliente conectado: {Context.ConnectionId}");
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"❌ Cliente desconectado: {Context.ConnectionId}");
            return base.OnDisconnectedAsync(exception);
        }

        public Task JoinGame(int gameId)
        {
            Console.WriteLine($"👉 Cliente {Context.ConnectionId} se unió al grupo game-{gameId}");
            return Groups.AddToGroupAsync(Context.ConnectionId, $"game-{gameId}");
        }

        public Task LeaveGame(int gameId)
        {
            Console.WriteLine($"👋 Cliente {Context.ConnectionId} salió del grupo game-{gameId}");
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, $"game-{gameId}");
        }
    }
}
