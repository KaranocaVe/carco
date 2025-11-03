using System;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace carco.Models.Entities
{
    [Keyless, Table("v_transmission_installs", Schema = "carco")]
    public class VTransmissionInstalls
    {
        [Column("vehicle_id")]
        public long VehicleId { get; set; }
        [Column("vin")]
        public string Vin { get; set; } = string.Empty;

        [Column("transmission_unit_id")]
        public long TransmissionUnitId { get; set; }
        [Column("serial_number")]
        public string SerialNumber { get; set; } = string.Empty;
        [Column("production_date")]
        public DateTime ProductionDate { get; set; }

        [Column("supplier_id")]
        public long SupplierId { get; set; }
        [Column("supplier_name")]
        public string SupplierName { get; set; } = string.Empty;

        [Column("part_spec_id")]
        public long PartSpecId { get; set; }
        [Column("spec_code")]
        public string SpecCode { get; set; } = string.Empty;
        [Column("part_spec_name")]
        public string PartSpecName { get; set; } = string.Empty;

        [Column("sale_id")]
        public long? SaleId { get; set; }
        [Column("sale_date")]
        public DateTime? SaleDate { get; set; }
        [Column("customer_id")]
        public long? CustomerId { get; set; }
        [Column("customer_name")]
        public string? CustomerName { get; set; }
    }
}
