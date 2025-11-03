using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using carco.Models.DTOs;

namespace carco.tests;

public static class TestHelpers
{
    public static bool HasDb() => !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DATABASE_URL"));

    public static (DateTime start, DateTime end) DefaultRange()
    {
        var end = DateTime.UtcNow.Date;
        var start = new DateTime(2023, 1, 1);
        return (start, end);
    }

    public static DateTime DefaultMonth() => new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

    public static async Task<string?> FirstBrandAsync(HttpClient client)
    {
        var brands = await client.GetFromJsonAsync<CatalogBrand[]>("/api/catalog/brands");
        return brands is { Length: > 0 } ? brands[0].Name : null;
    }

    public static async Task<string?> FirstModelOfBrandAsync(HttpClient client, string brand)
    {
        var modelArr = await client.GetFromJsonAsync<CatalogModel[]>($"/api/catalog/brands/{Uri.EscapeDataString(brand)}/models");
        return modelArr is { Length: > 0 } ? modelArr[0].Name : null;
    }

    public static async Task<string?> FirstSupplierAsync(HttpClient client)
    {
        var sup = await client.GetFromJsonAsync<CatalogSupplier[]>("/api/catalog/suppliers");
        return sup is { Length: > 0 } ? sup[0].Name : null;
    }
}


