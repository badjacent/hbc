using Microsoft.AspNetCore.Mvc;
using Back.Models;
using Back.Data;
using Back.Dto;

namespace Back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {

        private readonly Repository _db;

        public CustomersController(Repository dbContext)
        {
            _db = dbContext;
        }

        [HttpGet]
        public ActionResult<IEnumerable<CustomerDto>> GetCustomers()
        {
            return Ok(_db.Customers.Values.Select(c => CustomerDto.EntityToDto(c)).ToArray());
        }

        [HttpPost]
        public ActionResult<CustomerDto> CreateCustomer([FromBody] CreateCustomerRequest newCustomer)
        {            
            if (string.IsNullOrEmpty(newCustomer.FirstName)) 
                return BadRequest("Customer first name is required");
            if (string.IsNullOrEmpty(newCustomer.MiddleInitial)) 
                return BadRequest("Customer middle initial is required");
            if (string.IsNullOrEmpty(newCustomer.LastName)) 
                return BadRequest("Customer last name is required");

            // ?? should we enforce uniqueness of customer name?

            var customer = _db.AddCustomer(CreateCustomerRequest.DtoToEntity(newCustomer));
            return Ok(CustomerDto.EntityToDto(customer));
        }


        [HttpPut("{id}")]
        public ActionResult<CustomerDto> EditCustomer([FromBody] CustomerDto customer)
        {
            if (!_db.Customers.ContainsKey(customer.Id))
            {
                return NotFound();
            }
            _db.EditCustomer(CustomerDto.DtoToEntity(customer));
            return Ok(customer);
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteCustomer(int id)
        {
            if (!_db.Customers.ContainsKey(id))
            {
                return NotFound();
            }
            var customer = _db.Customers[id];
            try
            {
                _db.DeleteCustomer(customer);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
