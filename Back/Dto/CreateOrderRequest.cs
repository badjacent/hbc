using Back.Models;

namespace Back.Dto;

public record CreateOrderRequest {
    required public int SalespersonId { get; set;}
    required public int CustomerId { get; set; }
    required public int ProductId { get; set; }
    required public decimal Quantity { get; set; }

    public static Order DtoToEntity(CreateOrderRequest createOrderRequest) {
        return new Order {
            Id = 0,
            SalespersonId = createOrderRequest.SalespersonId,
            CustomerId = createOrderRequest.CustomerId,
            ProductId = createOrderRequest.ProductId,
            Quantity = createOrderRequest.Quantity,
        };
    }
}
