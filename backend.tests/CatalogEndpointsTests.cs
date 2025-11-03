using System;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace carco.tests;

public class CatalogEndpointsTests : IClassFixture<WebApplicationFactory<carco.Program>>
{
    private readonly WebApplicationFactory<carco.Program> _factory;
    public CatalogEndpointsTests(WebApplicationFactory<carco.Program> factory) { _factory = factory; }
    private HttpClient Create() => _factory.CreateClient();

    [Fact]
    public async Task Catalog_All_Should_Ok()
    {
        if (!TestHelpers.HasDb()) return;
        var client = Create();
        var b = await client.GetAsync("/api/catalog/brands");
        b.IsSuccessStatusCode.Should().BeTrue();
        var c = await client.GetAsync("/api/catalog/colors");
        c.IsSuccessStatusCode.Should().BeTrue();
        var s = await client.GetAsync("/api/catalog/suppliers");
        s.IsSuccessStatusCode.Should().BeTrue();
        var t = await client.GetAsync("/api/catalog/transmissions");
        t.IsSuccessStatusCode.Should().BeTrue();

        // models by brand
        var brand = await TestHelpers.FirstBrandAsync(client);
        if (!string.IsNullOrEmpty(brand))
        {
            var m = await client.GetAsync($"/api/catalog/brands/{Uri.EscapeDataString(brand)}/models");
            m.IsSuccessStatusCode.Should().BeTrue();
        }
    }
}


