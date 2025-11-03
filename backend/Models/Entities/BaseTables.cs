using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace carco.Models.Entities
{
    [Keyless, Table("brand", Schema = "carco")]
    public class BrandRow
    {
        [Column("brand_id")]
        public long BrandId { get; set; }
        [Column("name")]
        public string Name { get; set; } = string.Empty;
    }

    [Keyless, Table("model", Schema = "carco")]
    public class ModelRow
    {
        [Column("model_id")]
        public long ModelId { get; set; }
        [Column("brand_id")]
        public long BrandId { get; set; }
        [Column("name")]
        public string Name { get; set; } = string.Empty;
    }

    [Keyless, Table("color", Schema = "carco")]
    public class ColorRow
    {
        [Column("color_id")]
        public long ColorId { get; set; }
        [Column("name")]
        public string Name { get; set; } = string.Empty;
    }

    [Keyless, Table("supplier", Schema = "carco")]
    public class SupplierRow
    {
        [Column("supplier_id")]
        public long SupplierId { get; set; }
        [Column("name")]
        public string Name { get; set; } = string.Empty;
    }

    [Keyless, Table("part_spec", Schema = "carco")]
    public class PartSpecRow
    {
        [Column("part_spec_id")]
        public long PartSpecId { get; set; }
        [Column("category_id")]
        public long CategoryId { get; set; }
        [Column("name")]
        public string Name { get; set; } = string.Empty;
        [Column("spec_code")]
        public string SpecCode { get; set; } = string.Empty;
    }

    [Keyless, Table("vehicle", Schema = "carco")]
    public class VehicleRow
    {
        [Column("vehicle_id")]
        public long VehicleId { get; set; }
        [Column("model_id")]
        public long ModelId { get; set; }
        [Column("color_id")]
        public long ColorId { get; set; }
        [Column("transmission_unit_id")]
        public long TransmissionUnitId { get; set; }
    }

    [Keyless, Table("transmission_unit", Schema = "carco")]
    public class TransmissionUnitRow
    {
        [Column("transmission_unit_id")]
        public long TransmissionUnitId { get; set; }
        [Column("part_spec_id")]
        public long PartSpecId { get; set; }
        [Column("supplier_id")]
        public long SupplierId { get; set; }
    }
}
