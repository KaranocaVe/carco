using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using carco.Data;
using carco.Models.DTOs;
using carco.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace carco.Services
{
    public class CatalogService
    {
        private readonly CarcoContext _db;
        public CatalogService(CarcoContext db) { _db = db; }

        public async Task<List<CatalogBrand>> GetBrandsAsync(CancellationToken ct)
        {
            return await _db.Set<BrandRow>().AsNoTracking()
                .OrderBy(b => b.Name)
                .Select(b => new CatalogBrand
                {
                    Id = b.BrandId,
                    Name = b.Name
                })
                .ToListAsync(ct);
        }

        public async Task<List<CatalogModel>> GetModelsByBrandNameAsync(string brandName, string? colorName, CancellationToken ct)
        {
            IQueryable<CatalogModel> q = from m in _db.Set<ModelRow>().AsNoTracking()
                join b in _db.Set<BrandRow>().AsNoTracking() on m.BrandId equals b.BrandId
                where b.Name == brandName
                select new CatalogModel { Id = m.ModelId, Name = m.Name };

            if (!string.IsNullOrWhiteSpace(colorName))
            {
                // 按颜色存在性过滤（该品牌下有该颜色的车辆）
                var filtered = from x in q
                    join v in _db.Set<VehicleRow>().AsNoTracking() on x.Id equals v.ModelId
                    join c in _db.Set<ColorRow>().AsNoTracking() on v.ColorId equals c.ColorId
                    where c.Name == colorName
                    select new CatalogModel { Id = x.Id, Name = x.Name };
                q = filtered.Distinct().OrderBy(m => m.Name);
            }
            else
            {
                q = q.OrderBy(m => m.Name);
            }
            return await q.ToListAsync(ct);
        }

        public async Task<List<CatalogColor>> GetColorsAsync(string? brandName, string? modelName, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(brandName) && string.IsNullOrWhiteSpace(modelName))
            {
                return await _db.Set<ColorRow>().AsNoTracking()
                    .OrderBy(c => c.Name)
                    .Select(c => new CatalogColor { Id = c.ColorId, Name = c.Name })
                    .ToListAsync(ct);
            }

            IQueryable<CatalogColor> q = from c in _db.Set<ColorRow>().AsNoTracking()
                join v in _db.Set<VehicleRow>().AsNoTracking() on c.ColorId equals v.ColorId
                join m in _db.Set<ModelRow>().AsNoTracking() on v.ModelId equals m.ModelId
                join b in _db.Set<BrandRow>().AsNoTracking() on m.BrandId equals b.BrandId
                where (string.IsNullOrWhiteSpace(brandName) || b.Name == brandName)
                   && (string.IsNullOrWhiteSpace(modelName) || m.Name == modelName)
                select new CatalogColor { Id = c.ColorId, Name = c.Name };
            return await q.Distinct().OrderBy(x => x.Name).ToListAsync(ct);
        }

        public async Task<List<CatalogSupplier>> GetSuppliersAsync(string? brandName, string? modelName, string? colorName, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(brandName) && string.IsNullOrWhiteSpace(modelName) && string.IsNullOrWhiteSpace(colorName))
            {
                return await _db.Set<SupplierRow>().AsNoTracking()
                    .OrderBy(s => s.Name)
                    .Select(s => new CatalogSupplier { Id = s.SupplierId, Name = s.Name })
                    .ToListAsync(ct);
            }

            IQueryable<CatalogSupplier> q = from s in _db.Set<SupplierRow>().AsNoTracking()
                join tu in _db.Set<TransmissionUnitRow>().AsNoTracking() on s.SupplierId equals tu.SupplierId
                join v in _db.Set<VehicleRow>().AsNoTracking() on tu.TransmissionUnitId equals v.TransmissionUnitId
                join m in _db.Set<ModelRow>().AsNoTracking() on v.ModelId equals m.ModelId
                join b in _db.Set<BrandRow>().AsNoTracking() on m.BrandId equals b.BrandId
                join c in _db.Set<ColorRow>().AsNoTracking() on v.ColorId equals c.ColorId
                where (string.IsNullOrWhiteSpace(brandName) || b.Name == brandName)
                   && (string.IsNullOrWhiteSpace(modelName) || m.Name == modelName)
                   && (string.IsNullOrWhiteSpace(colorName) || c.Name == colorName)
                select new CatalogSupplier { Id = s.SupplierId, Name = s.Name };
            return await q.Distinct().OrderBy(x => x.Name).ToListAsync(ct);
        }

        public async Task<List<CatalogTransmission>> GetTransmissionsAsync(string? brandName, string? modelName, string? colorName, CancellationToken ct)
        {
            // 仅返回实际安装在车辆上的变速器（可选品牌/车型/颜色过滤）
            var q = from ps in _db.Set<PartSpecRow>().AsNoTracking()
                    join tu in _db.Set<TransmissionUnitRow>().AsNoTracking() on ps.PartSpecId equals tu.PartSpecId
                    join v in _db.Set<VehicleRow>().AsNoTracking() on tu.TransmissionUnitId equals v.TransmissionUnitId
                    join m in _db.Set<ModelRow>().AsNoTracking() on v.ModelId equals m.ModelId
                    join b in _db.Set<BrandRow>().AsNoTracking() on m.BrandId equals b.BrandId
                    join c in _db.Set<ColorRow>().AsNoTracking() on v.ColorId equals c.ColorId
                    where (string.IsNullOrWhiteSpace(brandName) || b.Name == brandName)
                       && (string.IsNullOrWhiteSpace(modelName) || m.Name == modelName)
                       && (string.IsNullOrWhiteSpace(colorName) || c.Name == colorName)
                    select new { ps.PartSpecId, ps.Name, ps.SpecCode };
            var list = await q.Distinct().OrderBy(x => x.Name).ToListAsync(ct);
            return list.Select(x => new CatalogTransmission { Id = x.PartSpecId, Name = x.Name, SpecCode = x.SpecCode }).ToList();
        }
    }
}
