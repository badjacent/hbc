namespace Back.Models;

public record Product {
    required public int Id { get; set; }
    required public string Name { get; set; }
    required public decimal Price { get; set; }
}