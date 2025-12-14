using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Back.Dto;
using Back.Tests.Infrastructure;
using Xunit;

namespace Back.Tests.Integration;

public class ProductsEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ProductsEndpointTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetProducts_ReturnsSeededProducts()
    {
        var products = await _client.GetFromJsonAsync<ProductDto[]>("/api/products");

        Assert.NotNull(products);
        Assert.Equal(3, products!.Length);
        Assert.Contains(products, p => p.Name == "Ramen");
        Assert.Contains(products, p => p.Name == "Expensive Thing");
        Assert.Contains(products, p => p.Name == "Futuristic Pizza");
    }
}
