using System;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace carco.Models.Entities
{
    [Keyless, Table("v_sales_detail", Schema = "carco")]
    public class VSalesDetail
    {
        [Column("sale_id")]
        public long SaleId { get; set; }
        [Column("sale_date")]
        public DateTime SaleDate { get; set; }
        [Column("sale_price")]
        public decimal SalePrice { get; set; }

        [Column("vehicle_id")]
        public long VehicleId { get; set; }
        [Column("vin")]
        public string Vin { get; set; } = string.Empty;
        [Column("model_id")]
        public long ModelId { get; set; }
        [Column("config_id")]
        public long ConfigId { get; set; }
        [Column("color_id")]
        public long ColorId { get; set; }
        [Column("model_name")]
        public string ModelName { get; set; } = string.Empty;

        [Column("brand_id")]
        public long BrandId { get; set; }
        [Column("brand_name")]
        public string BrandName { get; set; } = string.Empty;

        [Column("customer_id")]
        public long CustomerId { get; set; }
        [Column("customer_name")]
        public string CustomerName { get; set; } = string.Empty;
        [Column("customer_gender")]
        public string CustomerGender { get; set; } = string.Empty;
        [Column("customer_income")]
        public decimal? CustomerIncome { get; set; }

        [Column("dealer_id")]
        public long DealerId { get; set; }
        [Column("dealer_name")]
        public string DealerName { get; set; } = string.Empty;
        [Column("dealer_city")]
        public string DealerCity { get; set; } = string.Empty;
        [Column("dealer_province")]
        public string DealerProvince { get; set; } = string.Empty;
    }
}
