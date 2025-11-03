using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace carco.tests;

public class BasicAnalyticsTests : IClassFixture<WebApplicationFactory<carco.Program>>
{
    private readonly WebApplicationFactory<carco.Program> _factory;

    public BasicAnalyticsTests(WebApplicationFactory<carco.Program> factory)
    {
        _factory = factory;
    }

    [Fact(Skip = "设置 DATABASE_URL 后移除 Skip 执行集成测试")]
    public async Task TopBrandsUnits_Should_Return_200()
    {
        var client = _factory.CreateClient();
        var start = new DateTime(2023,1,1).ToString("yyyy-MM-dd");
        var end = new DateTime(2025,12,31).ToString("yyyy-MM-dd");
        var resp = await client.GetAsync($"/api/analytics/brands/top-units?start={start}&end={end}&limit=2");
        resp.IsSuccessStatusCode.Should().BeTrue();
        var data = await resp.Content.ReadFromJsonAsync<object>();
        data.Should().NotBeNull();
    }
}


