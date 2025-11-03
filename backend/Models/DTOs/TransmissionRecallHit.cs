using System;

namespace carco.Models.DTOs
{
    public class TransmissionRecallHit
    {
        public string Vin { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public DateTime ProductionDate { get; set; }
        public string? CustomerName { get; set; }
        public DateTime? SaleDate { get; set; }
    }
}
