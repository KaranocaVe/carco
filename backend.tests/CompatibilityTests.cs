using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace carco.tests;

public class CompatibilityTests : IClassFixture<WebApplicationFactory<carco.Program>>
{
    private readonly WebApplicationFactory<carco.Program> _factory;

    public CompatibilityTests(WebApplicationFactory<carco.Program> factory)
    {
        _factory = factory;
    }

    private static bool HasDb() => !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DATABASE_URL"));

    [Fact]
    public async Task SalesTrend_Should_Ok()
    {
        if (!HasDb()) return;
        var client = _factory.CreateClient();
        var resp = await client.GetAsync($"/api/analytics/sales/trend?start=2023-01-01&end=2025-12-31");
        resp.IsSuccessStatusCode.Should().BeTrue();
    }

    [Fact]
    public async Task TopBrands_Should_Ok()
    {
        if (!HasDb()) return;
        var client = _factory.CreateClient();
        var resp = await client.GetAsync($"/api/analytics/brands/top-units?start=2023-01-01&end=2025-12-31&limit=2");
        resp.IsSuccessStatusCode.Should().BeTrue();
    }

    [Fact]
    public async Task PriceSummary_With_And_Without_Filters_Should_Ok()
    {
        if (!HasDb()) return;
        var client = _factory.CreateClient();
        var resp1 = await client.GetAsync($"/api/analytics/price/summary?start=2023-01-01&end=2025-12-31");
        resp1.IsSuccessStatusCode.Should().BeTrue();
        var resp2 = await client.GetAsync($"/api/analytics/price/summary?start=2023-01-01&end=2025-12-31&brand=比亚迪");
        resp2.IsSuccessStatusCode.Should().BeTrue();
    }
}



