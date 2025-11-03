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

        public async Task<List<CatalogModel>> GetModelsByBrandNameAsync(string brandName, CancellationToken ct)
        {
            IQueryable<CatalogModel> q = from m in _db.Set<ModelRow>().AsNoTracking()
                join b in _db.Set<BrandRow>().AsNoTracking() on m.BrandId equals b.BrandId
                where b.Name == brandName
                orderby m.Name
                select new CatalogModel
                {
                    Id = m.ModelId,
                    Name = m.Name
                };
            return await q.ToListAsync(ct);
        }

        public async Task<List<CatalogColor>> GetColorsAsync(CancellationToken ct)
        {
            return await _db.Set<ColorRow>().AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new CatalogColor
                {
                    Id = c.ColorId,
                    Name = c.Name
                })
                .ToListAsync(ct);
        }

        public async Task<List<CatalogSupplier>> GetSuppliersAsync(CancellationToken ct)
        {
            return await _db.Set<SupplierRow>().AsNoTracking()
                .OrderBy(s => s.Name)
                .Select(s => new CatalogSupplier
                {
                    Id = s.SupplierId,
                    Name = s.Name
                })
                .ToListAsync(ct);
        }

        public async Task<List<CatalogTransmission>> GetTransmissionsAsync(CancellationToken ct)
        {
            // 通过 part_category 名称筛选 Transmission
            string sql = @"select ps.part_spec_id as Id, ps.name as Name, ps.spec_code as SpecCode
                    from carco.part_spec ps
                    join carco.part_category pc on pc.category_id = ps.category_id
                    where lower(pc.name) = 'transmission'
                    order by ps.name";
            return await _db.Set<CatalogTransmission>().FromSqlRaw(sql).AsNoTracking().ToListAsync(ct);
        }
    }
}
