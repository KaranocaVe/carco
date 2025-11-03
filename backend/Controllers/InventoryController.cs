using System;
using System.Threading;
using System.Threading.Tasks;
using carco.Services;
using Microsoft.AspNetCore.Mvc;

namespace carco.Controllers
{
    [ApiController, Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly InventoryService _svc;
        public InventoryController(InventoryService svc) { _svc = svc; }

        [HttpGet("unsold")]
        public async Task<IActionResult> Unsold([FromQuery] DateTime asOf, [FromQuery] long? dealerId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50, CancellationToken ct = default)
        {
            if (asOf == default) return BadRequest("asOf 参数不合法");
            DateTime aUtc = DateTime.SpecifyKind(asOf, DateTimeKind.Utc);
            return Ok(await _svc.GetUnsoldAsync(aUtc, dealerId, page, pageSize, ct));
        }

        [HttpGet("ageing")]
        public async Task<IActionResult> Ageing([FromQuery] DateTime asOf, [FromQuery] long? dealerId, CancellationToken ct = default)
        {
            if (asOf == default) return BadRequest("asOf 参数不合法");
            DateTime aUtc = DateTime.SpecifyKind(asOf, DateTimeKind.Utc);
            return Ok(await _svc.GetAgeingAsync(aUtc, dealerId, ct));
        }
    }
}
