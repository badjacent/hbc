using Back.Data;
using Back.Dto;
using Back.Models;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly Repository _db;

    public EmployeesController(Repository db)
    {
        _db = db;
    }

    [HttpGet]
    public ActionResult<IEnumerable<EmployeeDto>> GetEmployees()
    {
        return Ok(_db.Employees.Values.Select(EmployeeDto.EntityToDto).ToArray());
    }
}
