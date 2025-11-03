using System;
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
    public class RecallService
    {
        private readonly CarcoContext _db;

        public RecallService(CarcoContext db)
        {
            _db = db;
        }

        public async Task<List<TransmissionRecallHit>> GetTransmissionRecallAsync(string supplierName, DateTime from, DateTime to, CancellationToken ct)
        {
            List<TransmissionRecallHit> res = await _db.Set<VTransmissionInstalls>().AsNoTracking()
                .Where(x => x.SupplierName == supplierName && x.ProductionDate >= from && x.ProductionDate <= to)
                .Select(x => new TransmissionRecallHit
                {
                    Vin = x.Vin,
                    SerialNumber = x.SerialNumber,
                    ProductionDate = x.ProductionDate,
                    CustomerName = x.CustomerName,
                    SaleDate = x.SaleDate
                })
                .OrderBy(x => x.Vin)
                .ToListAsync(ct);
            return res;
        }

        public async Task<List<TransmissionRecallHit>> GetTransmissionRecallUnsoldAsync(string supplierName, DateTime from, DateTime to, CancellationToken ct)
        {
            List<TransmissionRecallHit> res = await _db.Set<VTransmissionInstalls>().AsNoTracking()
                .Where(x => x.SupplierName == supplierName && x.ProductionDate >= from && x.ProductionDate <= to && x.SaleId == null)
                .Select(x => new TransmissionRecallHit
                {
                    Vin = x.Vin,
                    SerialNumber = x.SerialNumber,
                    ProductionDate = x.ProductionDate,
                    CustomerName = null,
                    SaleDate = null
                })
                .OrderBy(x => x.Vin)
                .ToListAsync(ct);
            return res;
        }

        public async Task<List<RecallByModelDto>> GetTransmissionRecallByModelAsync(string supplierName, DateTime from, DateTime to, CancellationToken ct)
        {
            // 使用原生 SQL 连接 vehicle/model 得到车型名
            string sql = @"
            select m.name as ""ModelName"",
                   sum(case when s.sale_id is not null then 1 else 0 end)::int as ""Sold"",
                   sum(case when s.sale_id is null then 1 else 0 end)::int as ""Unsold"",
                   count(*)::int as ""Total""
            from carco.vehicle v
            join carco.model m on m.model_id = v.model_id
            join carco.transmission_unit tu on tu.transmission_unit_id = v.transmission_unit_id
            join carco.supplier sup on sup.supplier_id = tu.supplier_id
            left join carco.sale s on s.vehicle_id = v.vehicle_id
            where sup.name = {0} and tu.production_date between {1} and {2}
            group by m.name
            order by ""Total"" desc";
            List<RecallByModelDto> rows = await _db.Database.SqlQueryRaw<RecallByModelDto>(sql, supplierName, from, to).ToListAsync(ct);
            return rows;
        }
    }
}
