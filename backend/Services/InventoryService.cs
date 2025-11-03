using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using carco.Data;
using carco.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace carco.Services
{
    public class InventoryService
    {
        private readonly CarcoContext _db;
        public InventoryService(CarcoContext db) { _db = db; }

        public async Task<List<UnsoldVehicle>> GetUnsoldAsync(DateTime asOf, long? dealerId, int page, int pageSize, CancellationToken ct)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0 || pageSize > 200) pageSize = 50;
            string sql = @"select v.vin as ""Vin"", ia.dealer_id as ""DealerId"", d.name as ""DealerName"",
                          ia.received_at as ""ReceivedAt"",
                          (date({0}) - ia.received_at) as ""DaysInInventory""
                   from carco.inventory_assignment ia
                   join carco.vehicle v on v.vehicle_id = ia.vehicle_id
                   join carco.dealer d on d.dealer_id = ia.dealer_id
                   left join carco.sale s on s.vehicle_id = ia.vehicle_id
                   where s.vehicle_id is null and ({1} is null or ia.dealer_id = {1})
                   order by 5 desc
                   offset {2} rows fetch next {3} rows only";
            IQueryable<UnsoldVehicle> q = _db.Set<UnsoldVehicle>().FromSqlRaw(sql, asOf, dealerId ?? (object?)DBNull.Value, (page - 1) * pageSize, pageSize).AsNoTracking();
            return await q.ToListAsync(ct);
        }

        public async Task<List<InventoryAgeingBucket>> GetAgeingAsync(DateTime asOf, long? dealerId, CancellationToken ct)
        {
            string sql = @"with base as (
                        select (date({0}) - ia.received_at) as days
                        from carco.inventory_assignment ia
                        left join carco.sale s on s.vehicle_id = ia.vehicle_id
                        where s.vehicle_id is null and ({1} is null or ia.dealer_id = {1})
                    )
                    select 
                      case 
                        when days <= 30 then '0-30'
                        when days <= 60 then '31-60'
                        when days <= 90 then '61-90'
                        else '90+'
                      end as ""Bucket"",
                      count(*) as ""Count""
                    from base
                    group by 1
                    order by 1";
            IQueryable<InventoryAgeingBucket> q = _db.Set<InventoryAgeingBucket>().FromSqlRaw(sql, asOf, dealerId ?? (object?)DBNull.Value).AsNoTracking();
            return await q.ToListAsync(ct);
        }
    }
}
