using System;

namespace carco.Models.DTOs
{
    public class ModelBestMonth
    {
        public string ModelName { get; set; } = string.Empty;
        public DateTime Month { get; set; }
        public int Units { get; set; }
        public decimal Revenue { get; set; }
    }
}
