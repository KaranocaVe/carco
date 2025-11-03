using System;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace carco.Models.Entities
{
    [Keyless, Table("v_dealer_inventory_dwell", Schema = "carco")]
    public class VDealerInventoryDwell
    {
        [Column("dealer_id")]
        public long DealerId { get; set; }
        [Column("vehicle_id")]
        public long VehicleId { get; set; }
        [Column("received_at")]
        public DateTime ReceivedAt { get; set; }
        [Column("sale_date")]
        public DateTime? SaleDate { get; set; }
        [Column("days_in_inventory")]
        public int? DaysInInventory { get; set; }
    }
}
