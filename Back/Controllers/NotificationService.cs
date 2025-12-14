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
                var product = _repository.GetProduct(e.Payload.ProductId);
                if (product is null) throw new Exception("Product not found");
                var orderDto = OrderDto.EntityToDto(e.Payload, product);
                await _ordersHub.Clients.All.SendAsync("OrderChanged", new { type = e.Type, payload = orderDto });
            };
            _repository.OnCustomerChanged += async (e) => 
            {
                await _ordersHub.Clients.All.SendAsync("CustomerChanged", new { type = e.Type, payload = CustomerDto.EntityToDto(e.Payload) });
            };


            return Task.CompletedTask;
        }
    }
}
