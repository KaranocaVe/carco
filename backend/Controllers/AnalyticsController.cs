using System;
using System.Threading;
using System.Threading.Tasks;
using carco.Models.DTOs;
using carco.Services;
using Microsoft.AspNetCore.Mvc;

namespace carco.Controllers
{
    [ApiController, Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AnalyticsService _service;

        public AnalyticsController(AnalyticsService service)
        {
            _service = service;
        }

        [HttpGet("sales/trend")]
        public async Task<IActionResult> GetSalesTrend([FromQuery] DateTime start, [FromQuery] DateTime end, [FromQuery] bool segment = false, CancellationToken ct = default)
        {
            if (start == default || end == default || end < start)
                return BadRequest("start/end 参数不合法");
            DateTime sUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            DateTime eUtc = DateTime.SpecifyKind(end, DateTimeKind.Utc);
            List<SalesTrendPoint> data = await _service.GetSalesTrendAsync(sUtc, eUtc, segment, ct);
            return Ok(data);
        }

        [HttpGet("brands/top-revenue")]
        public async Task<IActionResult> GetTopBrandsRevenue([FromQuery] DateTime start, [FromQuery] DateTime end, [FromQuery] int limit = 2, CancellationToken ct = default)
        {
            if (start == default || end == default || end < start)
                return BadRequest("start/end 参数不合法");
            if (limit <= 0 || limit > 50) limit = 2;
            DateTime sUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            DateTime eUtc = DateTime.SpecifyKind(end, DateTimeKind.Utc);
            List<BrandTop> data = await _service.GetTopBrandsRevenueAsync(sUtc, eUtc, limit, ct);
            return Ok(data);
        }

        [HttpGet("brands/top-units")]
        public async Task<IActionResult> GetTopBrandsUnits([FromQuery] DateTime start, [FromQuery] DateTime end, [FromQuery] int limit = 2, CancellationToken ct = default)
        {
            if (start == default || end == default || end < start)
                return BadRequest("start/end 参数不合法");
            if (limit <= 0 || limit > 50) limit = 2;
            DateTime sUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            DateTime eUtc = DateTime.SpecifyKind(end, DateTimeKind.Utc);
            List<BrandTop> data = await _service.GetTopBrandsUnitsAsync(sUtc, eUtc, limit, ct);
            return Ok(data);
        }

        [HttpGet("models/{model}/best-month")]
        public async Task<IActionResult> GetModelBestMonth([FromRoute] string model, [FromQuery] DateTime start, [FromQuery] DateTime end, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(model)) return BadRequest("model 不能为空");
            if (start == default || end == default || end < start)
                return BadRequest("start/end 参数不合法");
            DateTime sUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            DateTime eUtc = DateTime.SpecifyKind(end, DateTimeKind.Utc);
            ModelBestMonth? best = await _service.GetModelBestMonthAsync(model, sUtc, eUtc, ct);
            if (best == null) return Ok(Array.Empty<ModelBestMonth>());
            return Ok(best);
        }

        [HttpGet("dealers/longest-dwell")]
        public async Task<IActionResult> GetDealerLongestDwell([FromQuery] DateTime start, [FromQuery] DateTime end, [FromQuery] bool includeUnsold = false, CancellationToken ct = default)
        {
            if (start == default || end == default || end < start)
                return BadRequest("start/end 参数不合法");
            DateTime sUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            DateTime eUtc = DateTime.SpecifyKind(end, DateTimeKind.Utc);
            DealerDwell? best = await _service.GetDealerWithLongestDwellAsync(sUtc, eUtc, includeUnsold, ct);
            if (best == null) return Ok(Array.Empty<DealerDwell>());
            return Ok(best);
        }

        [HttpGet("models/top")]
        public async Task<IActionResult> GetTopModels([FromQuery] DateTime start, [FromQuery] DateTime end, [FromQuery] int limit = 10, CancellationToken ct = default)
        {
            if (start == default || end == default || end < start) return BadRequest("start/end 参数不合法");
            if (limit <= 0 || limit > 100) limit = 10;
            DateTime sUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            DateTime eUtc = DateTime.SpecifyKind(end, DateTimeKind.Utc);
            return Ok(await _service.GetTopModelsAsync(sUtc, eUtc, limit, ct));
        }

        [HttpGet("brands/{brand}/models/top")]
        public async Task<IActionResult> GetTopModelsByBrand([FromRoute] string brand, [FromQuery] DateTime start, [FromQuery] DateTime end, [FromQuery] int limit = 10, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(brand)) return BadRequest("brand 不能为空");
            if (start == default || end == default || end < start) return BadRequest("start/end 参数不合法");
            if (limit <= 0 || limit > 100) limit = 10;
            DateTime sUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            DateTime eUtc = DateTime.SpecifyKind(end, DateTimeKind.Utc);
            return Ok(await _service.GetTopModelsByBrandAsync(brand, sUtc, eUtc, limit, ct));
        }

        [HttpGet("dealers/top-revenue")]
        public async Task<IActionResult> GetTopDealersRevenue([FromQuery] DateTime start, [FromQuery] DateTime end, [FromQuery] int limit = 10, CancellationToken ct = default)
        {
            if (start == default || end == default || end < start) return BadRequest("start/end 参数不合法");
            if (limit <= 0 || limit > 100) limit = 10;
            DateTime sUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            DateTime eUtc = DateTime.SpecifyKind(end, DateTimeKind.Utc);
            return Ok(await _service.GetTopDealersRevenueAsync(sUtc, eUtc, limit, ct));
        }

        [HttpGet("dealers/top-units")]
        public async Task<IActionResult> GetTopDealersUnits([FromQuery] DateTime start, [FromQuery] DateTime end, [FromQuery] int limit = 10, CancellationToken ct = default)
        {
            if (start == default || end == default || end < start) return BadRequest("start/end 参数不合法");
            if (limit <= 0 || limit > 100) limit = 10;
            DateTime sUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            DateTime eUtc = DateTime.SpecifyKind(end, DateTimeKind.Utc);
            return Ok(await _service.GetTopDealersUnitsAsync(sUtc, eUtc, limit, ct));
        }

        [HttpGet("colors/top")]
        public async Task<IActionResult> GetTopColors([FromQuery] DateTime start, [FromQuery] DateTime end, [FromQuery] int limit = 10, CancellationToken ct = default)
        {
            if (start == default || end == default || end < start) return BadRequest("start/end 参数不合法");
            if (limit <= 0 || limit > 100) limit = 10;
            DateTime sUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            DateTime eUtc = DateTime.SpecifyKind(end, DateTimeKind.Utc);
            return Ok(await _service.GetTopColorsAsync(sUtc, eUtc, limit, ct));
        }

        [HttpGet("price/summary")]
        public async Task<IActionResult> GetPriceSummary([FromQuery] DateTime start, [FromQuery] DateTime end, [FromQuery] string? brand, [FromQuery] string? model, CancellationToken ct = default)
        {
            if (start == default || end == default || end < start) return BadRequest("start/end 参数不合法");
            DateTime sUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            DateTime eUtc = DateTime.SpecifyKind(end, DateTimeKind.Utc);
            return Ok(await _service.GetPriceSummaryAsync(sUtc, eUtc, brand, model, ct));
        }

        [HttpGet("sales/yoy")]
        public async Task<IActionResult> GetYoY([FromQuery] DateTime month, CancellationToken ct = default)
        {
            if (month == default) return BadRequest("month 参数不合法");
            DateTime mUtc = DateTime.SpecifyKind(month, DateTimeKind.Utc);
            return Ok(await _service.GetYoYMoMAsync(mUtc, ct));
        }
    }
}
