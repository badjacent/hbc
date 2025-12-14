namespace Back.Models;

public record Employee {
    required public int Id { get; set; }
    required public string FirstName { get; set; }
    required public string MiddleInitial { get; set; }
    required public string LastName { get; set; }
}