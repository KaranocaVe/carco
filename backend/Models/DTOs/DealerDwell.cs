namespace carco.Models.DTOs
{
    public class DealerDwell
    {
        public long DealerId { get; set; }
        public string DealerName { get; set; } = string.Empty;
        public double AvgDays { get; set; }
        public int SampleSize { get; set; }
    }
}
