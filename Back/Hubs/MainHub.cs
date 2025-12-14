using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Back.Hubs
{
    // Handles open WebSocket connections for order notifications.
    public class MainHub : Microsoft.AspNetCore.SignalR.Hub
    {
        // SUBSCRIBE: An employee joins a specific "channel" (e.g., "Management", "General")
        public async Task SubscribeToChannel(string channelName)
        {
            // "Groups" is a built-in SignalR feature. 
            // It automatically tracks that THIS connection ID belongs to THAT group.
            await Groups.AddToGroupAsync(Context.ConnectionId, channelName);
            
            // Optional: Notify others in the group
            await Clients.Group(channelName).SendAsync("ReceiveMessage", "System", $"A new user joined {channelName}.");
        }

        // PUBLISH: Send a message to everyone in that channel
        public async Task PublishToChannel(string channelName, string employeeName, string message)
        {
            // We broadcast the message ONLY to people in that specific group
            await Clients.Group(channelName).SendAsync("ReceiveMessage", employeeName, message);
        }
    }
}
