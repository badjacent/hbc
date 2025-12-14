using Microsoft.AspNetCore.Mvc;
using Back.Models;
using Back.Data;
using Back.Dto;
using Microsoft.AspNetCore.SignalR;
using OrdersHub = Back.Hubs.MainHub;

namespace Back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly Repository _db;
        private readonly IHubContext<OrdersHub> _hubContext;

        public OrdersController(Repository dbContext, IHubContext<OrdersHub> hubContext)
        {
            _db = dbContext;
            _hubContext = hubContext;
        }

        [HttpGet]
        public ActionResult<IEnumerable<OrderDto>> GetOrders([FromQuery] int customerId)
        {
            return Ok(_db.OrdersForCustomer(customerId)
                .Select(o =>
                {
                    _db.Products.TryGetValue(o.ProductId, out var product);
                    return OrderDto.EntityToDto(o, product);
                })
                .ToArray());
        }
        [HttpPost]
        public ActionResult<OrderDto> CreateOrder([FromBody] CreateOrderRequest newOrder)
        {
            // handle errors
            var order = _db.AddOrder(CreateOrderRequest.DtoToEntity(newOrder));
            _db.Products.TryGetValue(order.ProductId, out var product);
            return Ok(OrderDto.EntityToDto(order, product));
        }

        [HttpPut("{id}")]
        public ActionResult<OrderDto> EditOrder(int id, [FromBody] CreateOrderRequest updatedOrder)
        {
            try
            {
                var order = _db.EditOrder(new Order
                {
                    Id = id,
                    SalespersonId = updatedOrder.SalespersonId,
                    CustomerId = updatedOrder.CustomerId,
                    ProductId = updatedOrder.ProductId,
                    Quantity = updatedOrder.Quantity
                });
                _db.Products.TryGetValue(order.ProductId, out var product);
                return Ok(OrderDto.EntityToDto(order, product));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteOrder(int id)
        {
            if (!_db.Orders.ContainsKey(id))
            {
                return NotFound();
            }

            var order = _db.Orders[id];
            try
            {
                _db.DeleteOrder(order);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
