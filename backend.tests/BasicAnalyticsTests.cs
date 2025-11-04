using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace carco.tests
{
    public class BasicAnalyticsTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public BasicAnalyticsTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact(Skip = "设置 DATABASE_URL 后移除 Skip 执行集成测试")]
        public async Task TopBrandsUnits_Should_Return_200()
        {
            HttpClient client = _factory.CreateClient();
            string start = new DateTime(2023, 1, 1).ToString("yyyy-MM-dd");
            string end = new DateTime(2025, 12, 31).ToString("yyyy-MM-dd");
            HttpResponseMessage resp = await client.GetAsync($"/api/analytics/brands/top-units?start={start}&end={end}&limit=2");
            resp.IsSuccessStatusCode.Should().BeTrue();
            object data = await resp.Content.ReadFromJsonAsync<object>();
            data.Should().NotBeNull();
        }
    }
}
