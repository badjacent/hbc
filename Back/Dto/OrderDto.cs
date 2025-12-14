using Back.Models;

namespace Back.Dto;

public record OrderDto {
    required public int Id { get; set; }
    required public int SalespersonId { get; set;}
    required public int CustomerId { get; set; }
    required public int ProductId { get; set; }
    required public decimal Quantity { get; set;}
    public string? ProductName { get; set; }

    public static OrderDto EntityToDto(Order order, Product? product = null) {
        return new OrderDto {
            Id = order.Id,
            SalespersonId = order.SalespersonId,
            CustomerId = order.CustomerId,
            ProductId = order.ProductId,
            Quantity = order.Quantity,
            ProductName = product?.Name
        };
    }

}
