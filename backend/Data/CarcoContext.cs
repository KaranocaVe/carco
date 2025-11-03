using Microsoft.EntityFrameworkCore;
using carco.Models.Entities;
using carco.Models.DTOs;

namespace carco.Data
{
    public class CarcoContext : DbContext
    {
        public CarcoContext(DbContextOptions<CarcoContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("carco");

            // 视图映射（Keyless）
            modelBuilder.Entity<VSalesDetail>().HasNoKey().ToView("v_sales_detail", "carco");
            modelBuilder.Entity<VDealerInventoryDwell>().HasNoKey().ToView("v_dealer_inventory_dwell", "carco");
            modelBuilder.Entity<VTransmissionInstalls>().HasNoKey().ToView("v_transmission_installs", "carco");

            // 基础表（查询用，Keyless 映射）
            modelBuilder.Entity<BrandRow>().HasNoKey().ToTable("brand", "carco");
            modelBuilder.Entity<ModelRow>().HasNoKey().ToTable("model", "carco");
            modelBuilder.Entity<ColorRow>().HasNoKey().ToTable("color", "carco");
            modelBuilder.Entity<SupplierRow>().HasNoKey().ToTable("supplier", "carco");
            modelBuilder.Entity<PartSpecRow>().HasNoKey().ToTable("part_spec", "carco");

            // 原生 SQL 投影类型
            modelBuilder.Entity<PriceSummary>().HasNoKey();
            modelBuilder.Entity<UnsoldVehicle>().HasNoKey();
            modelBuilder.Entity<InventoryAgeingBucket>().HasNoKey();
            modelBuilder.Entity<RecallByModelDto>().HasNoKey();
            modelBuilder.Entity<CatalogTransmission>().HasNoKey();

            base.OnModelCreating(modelBuilder);
        }
    }
}
