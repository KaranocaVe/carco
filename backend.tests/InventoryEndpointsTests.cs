using System;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace carco.tests
{
    public class InventoryEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        public InventoryEndpointsTests(WebApplicationFactory<Program> factory) { _factory = factory; }
        private HttpClient Create()
        {
            return _factory.CreateClient();
        }

        [Fact]
        public async Task Unsold_Basic()
        {
            if (!TestHelpers.HasDb()) return;
            DateTime asOf = DateTime.UtcNow.Date;
            HttpClient client = Create();
            HttpResponseMessage r = await client.GetAsync($"/api/inventory/unsold?asOf={asOf:yyyy-MM-dd}&page=1&pageSize=20");
            r.IsSuccessStatusCode.Should().BeTrue();
        }

        [Fact]
        public async Task Ageing_Basic()
        {
            if (!TestHelpers.HasDb()) return;
            DateTime asOf = DateTime.UtcNow.Date;
            HttpClient client = Create();
            HttpResponseMessage r = await client.GetAsync($"/api/inventory/ageing?asOf={asOf:yyyy-MM-dd}");
            r.IsSuccessStatusCode.Should().BeTrue();
        }
    }
}
