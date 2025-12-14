using Microsoft.AspNetCore.Mvc;
using Back.Models;
using Back.Data;
using Back.Dto;

namespace Back.Controllers {

    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly Repository _db;
        

        public ProductsController(Repository dbContext)
        {
            _db = dbContext;
        }

        [HttpGet]
        public ActionResult<IEnumerable<ProductDto>> GetProducts()
        {
            return Ok(_db.Products.Values.Select(p => ProductDto.EntityToDto(p)).ToArray());
        }
    }
}
