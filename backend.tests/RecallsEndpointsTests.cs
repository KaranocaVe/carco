using System;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace carco.tests;

public class RecallsEndpointsTests : IClassFixture<WebApplicationFactory<carco.Program>>
{
    private readonly WebApplicationFactory<carco.Program> _factory;
    public RecallsEndpointsTests(WebApplicationFactory<carco.Program> factory) { _factory = factory; }
    private HttpClient Create() => _factory.CreateClient();

    [Fact]
    public async Task Recall_Transmissions_All()
    {
        if (!TestHelpers.HasDb()) return;
        var client = Create();
        var supplier = await TestHelpers.FirstSupplierAsync(client);
        if (string.IsNullOrEmpty(supplier)) return;
        var (start, end) = TestHelpers.DefaultRange();
        var baseUrl = $"supplier={Uri.EscapeDataString(supplier)}&from={start:yyyy-MM-dd}&to={end:yyyy-MM-dd}";

        var r1 = await client.GetAsync($"/api/recalls/transmissions?{baseUrl}");
        r1.IsSuccessStatusCode.Should().BeTrue();

        var r2 = await client.GetAsync($"/api/recalls/transmissions/unsold?{baseUrl}");
        r2.IsSuccessStatusCode.Should().BeTrue();

        var r3 = await client.GetAsync($"/api/recalls/transmissions/by-model?{baseUrl}");
        r3.IsSuccessStatusCode.Should().BeTrue();
    }
}


