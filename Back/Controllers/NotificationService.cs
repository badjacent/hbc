using Back.Data;
using Back.Dto;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using OrdersHub = Back.Hubs.MainHub;

namespace Back.Controllers {

    public class NotificationService : BackgroundService
    {
        private readonly Repository _repository;
        private readonly IHubContext<OrdersHub> _ordersHub;

        public NotificationService(Repository repository, IHubContext<OrdersHub> ordersHub)
        {
            _repository = repository;
            _ordersHub = ordersHub;
        }

        protected override Task ExecuteAsync(CancellationToken token)
        {
            _repository.OnOrderChanged += async (e) => 
            {
                await _ordersHub.Clients.All.SendAsync("OrderChanged", e);
            };
            _repository.OnCustomerChanged += async (e) => 
            {
                await _ordersHub.Clients.All.SendAsync("CustomerChanged", e);
            };


            return Task.CompletedTask;
        }
    }
}
