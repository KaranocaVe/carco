namespace carco.Models.DTOs
{
    public class RecallByModelDto
    {
        public string ModelName { get; set; } = string.Empty;
        public int Sold { get; set; }
        public int Unsold { get; set; }
        public int Total { get; set; }
    }
}
