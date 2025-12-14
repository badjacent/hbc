namespace Back.Models;

public record Order {
    required public int Id { get; set; }
    required public int SalespersonId { get; set;} // foreign key to Employee
    required public int CustomerId { get; set; } // foreign key to Customer
    required public int ProductId { get; set; } // foreign key to Product
    required public decimal Quantity { get; set;}
}