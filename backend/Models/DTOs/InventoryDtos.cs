using System;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace carco.Models.DTOs
{
    [Keyless]
    public class UnsoldVehicle
    {
        public string Vin { get; set; } = string.Empty;
        public long DealerId { get; set; }
        public string DealerName { get; set; } = string.Empty;
        public DateTime ReceivedAt { get; set; }
        public int DaysInInventory { get; set; }
    }

    [Keyless]
    public class InventoryAgeingBucket
    {
        public string Bucket { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
