using Back.Models;

namespace Back.Dto;

public record EmployeeDto {
    required public int Id { get; set; }
    required public string FirstName { get; set; }
    required public string MiddleInitial { get; set; }
    required public string LastName { get; set; }

    public static EmployeeDto EntityToDto(Employee employee) {
        return new EmployeeDto {
            Id = employee.Id,
            FirstName = employee.FirstName,
            MiddleInitial = employee.MiddleInitial,
            LastName = employee.LastName,
        };
    }
    public static Employee DtoToEntity(EmployeeDto employeeDto) {   
        return new Employee {
            Id = employeeDto.Id,
            FirstName = employeeDto.FirstName,
            MiddleInitial = employeeDto.MiddleInitial,
            LastName = employeeDto.LastName,
        };
    }
}
