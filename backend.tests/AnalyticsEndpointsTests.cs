using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using carco.Models.DTOs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace carco.tests;

public class AnalyticsEndpointsTests : IClassFixture<WebApplicationFactory<carco.Program>>
{
    private readonly WebApplicationFactory<carco.Program> _factory;
    public AnalyticsEndpointsTests(WebApplicationFactory<carco.Program> factory) { _factory = factory; }

    private HttpClient Create() => _factory.CreateClient();

    [Fact]
    public async Task SalesTrend_Basic()
    {
        if (!TestHelpers.HasDb()) return;
        var (start, end) = TestHelpers.DefaultRange();
        var client = Create();
        var url = $"/api/analytics/sales/trend?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}&segment=false";
        var resp = await client.GetAsync(url);
        resp.IsSuccessStatusCode.Should().BeTrue();
        var data = await resp.Content.ReadFromJsonAsync<SalesTrendPoint[]>();
        data.Should().NotBeNull();
    }

    [Fact]
    public async Task TopBrands_Units_And_Revenue()
    {
        if (!TestHelpers.HasDb()) return;
        var (start, end) = TestHelpers.DefaultRange();
        var client = Create();
        var r1 = await client.GetAsync($"/api/analytics/brands/top-units?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}&limit=5");
        r1.IsSuccessStatusCode.Should().BeTrue();
        var r2 = await client.GetAsync($"/api/analytics/brands/top-revenue?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}&limit=5");
        r2.IsSuccessStatusCode.Should().BeTrue();
    }

    [Fact]
    public async Task TopModels_Global_And_ByBrand()
    {
        if (!TestHelpers.HasDb()) return;
        var (start, end) = TestHelpers.DefaultRange();
        var client = Create();
        var r1 = await client.GetAsync($"/api/analytics/models/top?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}&limit=5");
        r1.IsSuccessStatusCode.Should().BeTrue();

        var brand = await TestHelpers.FirstBrandAsync(client);
        if (!string.IsNullOrEmpty(brand))
        {
            var r2 = await client.GetAsync($"/api/analytics/brands/{Uri.EscapeDataString(brand)}/models/top?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}&limit=5");
            r2.IsSuccessStatusCode.Should().BeTrue();
        }
    }

    [Fact]
    public async Task Dealers_Top_Units_And_Revenue()
    {
        if (!TestHelpers.HasDb()) return;
        var (start, end) = TestHelpers.DefaultRange();
        var client = Create();
        var r1 = await client.GetAsync($"/api/analytics/dealers/top-units?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}&limit=5");
        r1.IsSuccessStatusCode.Should().BeTrue();
        var r2 = await client.GetAsync($"/api/analytics/dealers/top-revenue?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}&limit=5");
        r2.IsSuccessStatusCode.Should().BeTrue();
    }

    [Fact]
    public async Task Colors_Top_Basic()
    {
        if (!TestHelpers.HasDb()) return;
        var (start, end) = TestHelpers.DefaultRange();
        var client = Create();
        var r = await client.GetAsync($"/api/analytics/colors/top?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}&limit=5");
        r.IsSuccessStatusCode.Should().BeTrue();
    }

    [Fact]
    public async Task Price_Summary_Basic_And_Filtered()
    {
        if (!TestHelpers.HasDb()) return;
        var (start, end) = TestHelpers.DefaultRange();
        var client = Create();
        var r1 = await client.GetAsync($"/api/analytics/price/summary?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}");
        r1.IsSuccessStatusCode.Should().BeTrue();

        var brand = await TestHelpers.FirstBrandAsync(client);
        if (!string.IsNullOrEmpty(brand))
        {
            var model = await TestHelpers.FirstModelOfBrandAsync(client, brand!);
            var url = $"/api/analytics/price/summary?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}&brand={Uri.EscapeDataString(brand!)}" +
                      (string.IsNullOrEmpty(model) ? string.Empty : $"&model={Uri.EscapeDataString(model)}");
            var r2 = await client.GetAsync(url);
            r2.IsSuccessStatusCode.Should().BeTrue();
        }
    }

    [Fact]
    public async Task Sales_YoYMoM()
    {
        if (!TestHelpers.HasDb()) return;
        var month = TestHelpers.DefaultMonth();
        var client = Create();
        var r = await client.GetAsync($"/api/analytics/sales/yoy?month={month:yyyy-MM-01}");
        r.IsSuccessStatusCode.Should().BeTrue();
    }

    [Fact]
    public async Task Dealers_Longest_Dwell()
    {
        if (!TestHelpers.HasDb()) return;
        var (start, end) = TestHelpers.DefaultRange();
        var client = Create();
        var r = await client.GetAsync($"/api/analytics/dealers/longest-dwell?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}&includeUnsold=false");
        r.IsSuccessStatusCode.Should().BeTrue();
    }
}


