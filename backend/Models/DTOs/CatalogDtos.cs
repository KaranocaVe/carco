using Microsoft.EntityFrameworkCore;

namespace carco.Models.DTOs
{
    public class CatalogBrand
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CatalogModel
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CatalogColor
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CatalogSupplier
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    [Keyless]
    public class CatalogTransmission
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SpecCode { get; set; } = string.Empty;
    }
}
