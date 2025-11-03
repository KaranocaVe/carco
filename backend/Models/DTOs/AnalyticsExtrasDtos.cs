using System;
using Microsoft.EntityFrameworkCore;

namespace carco.Models.DTOs
{
    public class ModelTop
    {
        public string ModelName { get; set; } = string.Empty;
        public int Units { get; set; }
        public decimal Revenue { get; set; }
    }

    public class DealerTop
    {
        public long DealerId { get; set; }
        public string DealerName { get; set; } = string.Empty;
        public int Units { get; set; }
        public decimal Revenue { get; set; }
    }

    public class ColorTop
    {
        public long ColorId { get; set; }
        public string ColorName { get; set; } = string.Empty;
        public int Units { get; set; }
    }

    [Keyless]
    public class PriceSummary
    {
        public decimal Min { get; set; }
        public decimal Avg { get; set; }
        public decimal Median { get; set; }
        public decimal P95 { get; set; }
        public int Samples { get; set; }
    }

    public class YoYMoM
    {
        public DateTime Month { get; set; }
        public int Units { get; set; }
        public decimal Revenue { get; set; }
        public int PrevMonthUnits { get; set; }
        public decimal PrevMonthRevenue { get; set; }
        public int PrevYearUnits { get; set; }
        public decimal PrevYearRevenue { get; set; }
    }
}
