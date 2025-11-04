using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using carco.Models.DTOs;

namespace carco.tests
{
    public static class TestHelpers
    {
        public static bool HasDb()
        {
            return !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DATABASE_URL"));
        }

        public static (DateTime start, DateTime end) DefaultRange()
        {
            DateTime end = DateTime.UtcNow.Date;
            DateTime start = new(2023, 1, 1);
            return (start, end);
        }

        public static DateTime DefaultMonth()
        {
            return new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        }

        public static async Task<string?> FirstBrandAsync(HttpClient client)
        {
            CatalogBrand[] brands = await client.GetFromJsonAsync<CatalogBrand[]>("/api/catalog/brands");
            return brands is { Length: > 0 } ? brands[0].Name : null;
        }

        public static async Task<string?> FirstModelOfBrandAsync(HttpClient client, string brand)
        {
            CatalogModel[] modelArr = await client.GetFromJsonAsync<CatalogModel[]>($"/api/catalog/brands/{Uri.EscapeDataString(brand)}/models");
            return modelArr is { Length: > 0 } ? modelArr[0].Name : null;
        }

        public static async Task<string?> FirstSupplierAsync(HttpClient client)
        {
            CatalogSupplier[] sup = await client.GetFromJsonAsync<CatalogSupplier[]>("/api/catalog/suppliers");
            return sup is { Length: > 0 } ? sup[0].Name : null;
        }
    }
}
