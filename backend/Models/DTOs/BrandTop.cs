namespace carco.Models.DTOs
{
    public class BrandTop
    {
        public long BrandId { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public int Units { get; set; }
        public decimal Revenue { get; set; }
    }
}
