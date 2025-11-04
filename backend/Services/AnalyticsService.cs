using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using carco.Data;
using carco.Models.DTOs;
using carco.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;

namespace carco.Services
{
    public class AnalyticsService
    {
        private readonly CarcoContext _db;

        public AnalyticsService(CarcoContext db)
        {
            _db = db;
        }

        public async Task<List<SalesTrendPoint>> GetSalesTrendAsync(DateTime start, DateTime end, bool segment, CancellationToken ct)
        {
            IQueryable<VSalesDetail> q = _db.Set<VSalesDetail>().AsNoTracking()
                .Where(s => s.SaleDate >= start && s.SaleDate <= end);

            if (!segment)
            {
                var rows = await q
                    .GroupBy(s => new
                    {
                        s.BrandId,
                        s.BrandName,
                        Y = s.SaleDate.Year,
                        M = s.SaleDate.Month
                    })
                    .Select(g => new
                    {
                        g.Key.BrandId,
                        g.Key.BrandName,
                        g.Key.Y,
                        g.Key.M,
                        Units = g.Count(),
                        Revenue = g.Sum(x => x.SalePrice)
                    })
                    .OrderBy(x => x.Y).ThenBy(x => x.M).ThenBy(x => x.BrandName)
                    .ToListAsync(ct);

                return rows.Select(r => new SalesTrendPoint
                {
                    BrandId = r.BrandId,
                    BrandName = r.BrandName,
                    Month = new DateTime(r.Y, r.M, 1),
                    Units = r.Units,
                    Revenue = r.Revenue
                }).ToList();
            }
            else
            {
                var rows = await q
                    .GroupBy(s => new
                    {
                        s.BrandId,
                        s.BrandName,
                        Y = s.SaleDate.Year,
                        M = s.SaleDate.Month,
                        s.CustomerGender,
                        IncomeBucket =
                            s.CustomerIncome == null ? "Unknown" :
                            s.CustomerIncome < 10000m ? "[0,1w)" :
                            s.CustomerIncome < 20000m ? "[1w,2w)" :
                            s.CustomerIncome < 30000m ? "[2w,3w)" :
                            s.CustomerIncome < 50000m ? "[3w,5w)" :
                            s.CustomerIncome < 100000m ? "[5w,10w)" : "10w+"
                    })
                    .Select(g => new
                    {
                        g.Key.BrandId,
                        g.Key.BrandName,
                        g.Key.Y,
                        g.Key.M,
                        g.Key.CustomerGender,
                        g.Key.IncomeBucket,
                        Units = g.Count(),
                        Revenue = g.Sum(x => x.SalePrice)
                    })
                    .OrderBy(x => x.Y).ThenBy(x => x.M).ThenBy(x => x.BrandName).ThenBy(x => x.CustomerGender).ThenBy(x => x.IncomeBucket)
                    .ToListAsync(ct);

                return rows.Select(r => new SalesTrendPoint
                {
                    BrandId = r.BrandId,
                    BrandName = r.BrandName,
                    Month = new DateTime(r.Y, r.M, 1),
                    Units = r.Units,
                    Revenue = r.Revenue,
                    Gender = r.CustomerGender,
                    IncomeBucket = r.IncomeBucket
                }).ToList();
            }
        }

        public async Task<List<BrandTop>> GetTopBrandsRevenueAsync(DateTime start, DateTime end, int limit, CancellationToken ct)
        {
            List<BrandTop> res = await _db.Set<VSalesDetail>().AsNoTracking()
                .Where(s => s.SaleDate >= start && s.SaleDate <= end)
                .GroupBy(s => new
                {
                    s.BrandId,
                    s.BrandName
                })
                .Select(g => new BrandTop
                {
                    BrandId = g.Key.BrandId,
                    BrandName = g.Key.BrandName,
                    Units = g.Count(),
                    Revenue = g.Sum(x => x.SalePrice)
                })
                .OrderByDescending(x => x.Revenue)
                .Take(limit)
                .ToListAsync(ct);
            return res;
        }

        public async Task<List<BrandTop>> GetTopBrandsUnitsAsync(DateTime start, DateTime end, int limit, CancellationToken ct)
        {
            List<BrandTop> res = await _db.Set<VSalesDetail>().AsNoTracking()
                .Where(s => s.SaleDate >= start && s.SaleDate <= end)
                .GroupBy(s => new
                {
                    s.BrandId,
                    s.BrandName
                })
                .Select(g => new BrandTop
                {
                    BrandId = g.Key.BrandId,
                    BrandName = g.Key.BrandName,
                    Units = g.Count(),
                    Revenue = g.Sum(x => x.SalePrice)
                })
                .OrderByDescending(x => x.Units)
                .Take(limit)
                .ToListAsync(ct);
            return res;
        }

        public async Task<ModelBestMonth?> GetModelBestMonthAsync(string modelName, DateTime start, DateTime end, CancellationToken ct)
        {
            var rows2 = await _db.Set<VSalesDetail>().AsNoTracking()
                .Where(s => s.SaleDate >= start && s.SaleDate <= end && s.ModelName == modelName)
                .GroupBy(s => new
                {
                    Y = s.SaleDate.Year,
                    M = s.SaleDate.Month
                })
                .Select(g => new
                {
                    g.Key.Y,
                    g.Key.M,
                    Units = g.Count(),
                    Revenue = g.Sum(x => x.SalePrice)
                })
                .OrderByDescending(x => x.Units).ThenByDescending(x => x.Revenue)
                .Take(1)
                .ToListAsync(ct);

            var row = rows2.FirstOrDefault();
            if (row == null) return null;
            return new ModelBestMonth
            {
                ModelName = modelName,
                Month = new DateTime(row.Y, row.M, 1),
                Units = row.Units,
                Revenue = row.Revenue
            };
        }

        public async Task<DealerDwell?> GetDealerWithLongestDwellAsync(DateTime start, DateTime end, bool includeUnsold, CancellationToken ct)
        {
            // 仅计算已售样本的平均库存时间（与 v_dealer_inventory_dwell 一致）
            IQueryable<VDealerInventoryDwell> sold = _db.Set<VDealerInventoryDwell>().AsNoTracking()
                .Where(x => x.SaleDate != null && x.SaleDate >= start && x.SaleDate <= end && x.DaysInInventory != null);

            var joined = from d in sold
                join s in _db.Set<VSalesDetail>().AsNoTracking()
                    on d.VehicleId equals s.VehicleId
                select new
                {
                    d.DealerId,
                    s.DealerName,
                    d.DaysInInventory
                };

            IQueryable<DealerDwell> q = joined
                .GroupBy(x => new
                {
                    x.DealerId,
                    x.DealerName
                })
                .Select(g => new DealerDwell
                {
                    DealerId = g.Key.DealerId,
                    DealerName = g.Key.DealerName,
                    AvgDays = g.Average(x => (double)x.DaysInInventory!),
                    SampleSize = g.Count()
                })
                .OrderByDescending(x => x.AvgDays)
                .Take(1);

            return await q.FirstOrDefaultAsync(ct);
        }

        public async Task<List<ModelTop>> GetTopModelsAsync(DateTime start, DateTime end, int limit, CancellationToken ct)
        {
            return await _db.Set<VSalesDetail>().AsNoTracking()
                .Where(s => s.SaleDate >= start && s.SaleDate <= end)
                .GroupBy(s => s.ModelName)
                .Select(g => new ModelTop
                {
                    ModelName = g.Key,
                    Units = g.Count(),
                    Revenue = g.Sum(x => x.SalePrice)
                })
                .OrderByDescending(x => x.Units).ThenByDescending(x => x.Revenue)
                .Take(limit)
                .ToListAsync(ct);
        }

        public async Task<List<ModelTop>> GetTopModelsByBrandAsync(string brand, DateTime start, DateTime end, int limit, CancellationToken ct)
        {
            return await _db.Set<VSalesDetail>().AsNoTracking()
                .Where(s => s.BrandName == brand && s.SaleDate >= start && s.SaleDate <= end)
                .GroupBy(s => s.ModelName)
                .Select(g => new ModelTop
                {
                    ModelName = g.Key,
                    Units = g.Count(),
                    Revenue = g.Sum(x => x.SalePrice)
                })
                .OrderByDescending(x => x.Units).ThenByDescending(x => x.Revenue)
                .Take(limit)
                .ToListAsync(ct);
        }

        public async Task<List<DealerTop>> GetTopDealersRevenueAsync(DateTime start, DateTime end, int limit, CancellationToken ct)
        {
            return await _db.Set<VSalesDetail>().AsNoTracking()
                .Where(s => s.SaleDate >= start && s.SaleDate <= end)
                .GroupBy(s => new
                {
                    s.DealerId,
                    s.DealerName
                })
                .Select(g => new DealerTop
                {
                    DealerId = g.Key.DealerId,
                    DealerName = g.Key.DealerName,
                    Units = g.Count(),
                    Revenue = g.Sum(x => x.SalePrice)
                })
                .OrderByDescending(x => x.Revenue)
                .Take(limit)
                .ToListAsync(ct);
        }

        public async Task<List<DealerTop>> GetTopDealersUnitsAsync(DateTime start, DateTime end, int limit, CancellationToken ct)
        {
            return await _db.Set<VSalesDetail>().AsNoTracking()
                .Where(s => s.SaleDate >= start && s.SaleDate <= end)
                .GroupBy(s => new
                {
                    s.DealerId,
                    s.DealerName
                })
                .Select(g => new DealerTop
                {
                    DealerId = g.Key.DealerId,
                    DealerName = g.Key.DealerName,
                    Units = g.Count(),
                    Revenue = g.Sum(x => x.SalePrice)
                })
                .OrderByDescending(x => x.Units)
                .Take(limit)
                .ToListAsync(ct);
        }

        public async Task<List<ColorTop>> GetTopColorsAsync(DateTime start, DateTime end, int limit, CancellationToken ct)
        {
            // 通过 color 维表取名称
            IQueryable<ColorRow> colors = _db.Set<ColorRow>().AsNoTracking();
            List<ColorTop> res = await _db.Set<VSalesDetail>().AsNoTracking()
                .Where(s => s.SaleDate >= start && s.SaleDate <= end)
                .GroupBy(s => s.ColorId)
                .Select(g => new
                {
                    ColorId = g.Key,
                    Units = g.Count()
                })
                .OrderByDescending(x => x.Units)
                .Take(limit)
                .Join(colors, a => a.ColorId, c => c.ColorId, (a, c) => new ColorTop
                {
                    ColorId = a.ColorId,
                    ColorName = c.Name,
                    Units = a.Units
                })
                .ToListAsync(ct);
            return res;
        }

        public async Task<PriceSummary> GetPriceSummaryAsync(DateTime start, DateTime end, string? brand, string? model, CancellationToken ct)
        {
            // 使用窗口函数计算中位数与 p95；动态构建条件，避免空参数导致类型未知
            StringBuilder sb = new();
            sb.Append(@"select 
              min(sale_price)::numeric as ""Min"",
              avg(sale_price)::numeric as ""Avg"",
              (percentile_cont(0.5) within group (order by sale_price))::numeric as ""Median"",
              (percentile_cont(0.95) within group (order by sale_price))::numeric as ""P95"",
              count(*)::int as ""Samples""
            from carco.v_sales_detail
            where sale_date between @start and @end");

            List<object> parameters = new();
            parameters.Add(new Npgsql.NpgsqlParameter("start", start));
            parameters.Add(new Npgsql.NpgsqlParameter("end", end));
            if (!string.IsNullOrWhiteSpace(brand))
            {
                sb.Append(" and brand_name = @brand");
                parameters.Add(new Npgsql.NpgsqlParameter("brand", brand!));
            }
            if (!string.IsNullOrWhiteSpace(model))
            {
                sb.Append(" and model_name = @model");
                parameters.Add(new Npgsql.NpgsqlParameter("model", model!));
            }

            string sql = sb.ToString();
            IQueryable<PriceSummary> query = _db.Set<PriceSummary>().FromSqlRaw(sql, parameters.ToArray()).AsNoTracking();
            return await query.FirstAsync(ct);
        }

        public async Task<YoYMoM> GetYoYMoMAsync(DateTime month, CancellationToken ct)
        {
            DateTime first = new(month.Year, month.Month, 1);
            DateTime nextMonth = first.AddMonths(1);
            DateTime prevMonthStart = first.AddMonths(-1);
            DateTime prevMonthEnd = first.AddDays(-1);
            DateTime prevYearStart = first.AddYears(-1);
            DateTime prevYearEnd = nextMonth.AddYears(-1).AddDays(-1);

            async Task<(int units, decimal revenue)> SumRange(DateTime s, DateTime e)
            {
                var q = await _db.Set<VSalesDetail>().AsNoTracking()
                    .Where(x => x.SaleDate >= s && x.SaleDate < e)
                    .GroupBy(_ => 1)
                    .Select(g => new
                    {
                        Units = g.Count(),
                        Revenue = g.Sum(x => x.SalePrice)
                    })
                    .FirstOrDefaultAsync(ct);
                return q == null ? (0, 0m) : (q.Units, q.Revenue);
            }

            (int u, decimal r) = await SumRange(first, nextMonth);
            (int pmu, decimal pmr) = await SumRange(prevMonthStart, prevMonthEnd.AddDays(1));
            (int pyu, decimal pyr) = await SumRange(prevYearStart, prevYearEnd.AddDays(1));
            return new YoYMoM
            {
                Month = first,
                Units = u,
                Revenue = r,
                PrevMonthUnits = pmu,
                PrevMonthRevenue = pmr,
                PrevYearUnits = pyu,
                PrevYearRevenue = pyr
            };
        }
    }
}
