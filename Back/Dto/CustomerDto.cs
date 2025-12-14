using Back.Models;

namespace Back.Dto;

public record CreateCustomerRequest {
    required public string FirstName { get; set; }
    required public string MiddleInitial { get; set; }
    required public string LastName { get; set; }

    public static Customer DtoToEntity(CreateCustomerRequest customerDto) {
        return new Customer {
            Id = 0,
            FirstName = customerDto.FirstName,
            MiddleInitial = customerDto.MiddleInitial,
            LastName = customerDto.LastName,
        };
    }

}

public record CustomerDto {
    required public int Id { get; set; }
    required public string FirstName { get; set; }
    required public string MiddleInitial { get; set; }
    required public string LastName { get; set; }

    public static CustomerDto EntityToDto(Customer customer) {
        return new CustomerDto {
            Id = customer.Id,
            FirstName = customer.FirstName,
            MiddleInitial = customer.MiddleInitial,
            LastName = customer.LastName,
        };
    }
    public static Customer DtoToEntity(CustomerDto customerDto) {
        return new Customer {
            Id = customerDto.Id,
            FirstName = customerDto.FirstName,
            MiddleInitial = customerDto.MiddleInitial,
            LastName = customerDto.LastName,
        };
    }
}
