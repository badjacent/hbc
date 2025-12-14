using Back.Models;

namespace Back.Dto;

public record ProductDto {
    required public int Id { get; set; }
    required public string Name { get; set; }
    required public decimal Price { get; set; }

    public static ProductDto EntityToDto(Product product) {
        return new ProductDto {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price,
        };
    }
    public static Product DtoToEntity(ProductDto productDto) {
        return new Product {
            Id = productDto.Id,
            Name = productDto.Name,
            Price = productDto.Price,
        };
    }
}