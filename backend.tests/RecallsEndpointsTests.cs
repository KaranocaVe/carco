using System;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace carco.tests
{
    public class RecallsEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        public RecallsEndpointsTests(WebApplicationFactory<Program> factory) { _factory = factory; }
        private HttpClient Create()
        {
            return _factory.CreateClient();
        }

        [Fact]
        public async Task Recall_Transmissions_All()
        {
            if (!TestHelpers.HasDb()) return;
            HttpClient client = Create();
            string supplier = await TestHelpers.FirstSupplierAsync(client);
            if (string.IsNullOrEmpty(supplier)) return;
            (DateTime start, DateTime end) = TestHelpers.DefaultRange();
            string baseUrl = $"supplier={Uri.EscapeDataString(supplier)}&from={start:yyyy-MM-dd}&to={end:yyyy-MM-dd}";

            HttpResponseMessage r1 = await client.GetAsync($"/api/recalls/transmissions?{baseUrl}");
            r1.IsSuccessStatusCode.Should().BeTrue();

            HttpResponseMessage r2 = await client.GetAsync($"/api/recalls/transmissions/unsold?{baseUrl}");
            r2.IsSuccessStatusCode.Should().BeTrue();

            HttpResponseMessage r3 = await client.GetAsync($"/api/recalls/transmissions/by-model?{baseUrl}");
            r3.IsSuccessStatusCode.Should().BeTrue();
        }
    }
}
