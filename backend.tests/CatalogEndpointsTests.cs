using System;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace carco.tests
{
    public class CatalogEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        public CatalogEndpointsTests(WebApplicationFactory<Program> factory) { _factory = factory; }
        private HttpClient Create()
        {
            return _factory.CreateClient();
        }

        [Fact]
        public async Task Catalog_All_Should_Ok()
        {
            if (!TestHelpers.HasDb()) return;
            HttpClient client = Create();
            HttpResponseMessage b = await client.GetAsync("/api/catalog/brands");
            b.IsSuccessStatusCode.Should().BeTrue();
            HttpResponseMessage c = await client.GetAsync("/api/catalog/colors");
            c.IsSuccessStatusCode.Should().BeTrue();
            HttpResponseMessage s = await client.GetAsync("/api/catalog/suppliers");
            s.IsSuccessStatusCode.Should().BeTrue();
            HttpResponseMessage t = await client.GetAsync("/api/catalog/transmissions");
            t.IsSuccessStatusCode.Should().BeTrue();

            // models by brand
            string brand = await TestHelpers.FirstBrandAsync(client);
            if (!string.IsNullOrEmpty(brand))
            {
                HttpResponseMessage m = await client.GetAsync($"/api/catalog/brands/{Uri.EscapeDataString(brand)}/models");
                m.IsSuccessStatusCode.Should().BeTrue();
            }
        }
    }
}
