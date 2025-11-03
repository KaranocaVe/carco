using System;

namespace carco.Models.DTOs
{
    public class SalesTrendPoint
    {
        public long BrandId { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public DateTime Month { get; set; }
        public int Units { get; set; }
        public decimal Revenue { get; set; }
        public string? Gender { get; set; }
        public string? IncomeBucket { get; set; }
    }
}
