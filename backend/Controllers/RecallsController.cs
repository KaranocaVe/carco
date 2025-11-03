using System;
using System.Threading;
using System.Threading.Tasks;
using carco.Models.DTOs;
using carco.Services;
using Microsoft.AspNetCore.Mvc;

namespace carco.Controllers
{
    [ApiController, Route("api/[controller]")]
    public class RecallsController : ControllerBase
    {
        private readonly RecallService _service;

        public RecallsController(RecallService service)
        {
            _service = service;
        }

        [HttpGet("transmissions")]
        public async Task<IActionResult> GetTransmissionRecall([FromQuery] string supplier, [FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(supplier)) return BadRequest("supplier 不能为空");
            if (from == default || to == default || to < from) return BadRequest("from/to 参数不合法");
            DateTime fUtc = DateTime.SpecifyKind(from, DateTimeKind.Utc);
            DateTime tUtc = DateTime.SpecifyKind(to, DateTimeKind.Utc);
            List<TransmissionRecallHit> data = await _service.GetTransmissionRecallAsync(supplier, fUtc, tUtc, ct);
            return Ok(data);
        }

        [HttpGet("transmissions/unsold")]
        public async Task<IActionResult> GetTransmissionRecallUnsold([FromQuery] string supplier, [FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(supplier)) return BadRequest("supplier 不能为空");
            if (from == default || to == default || to < from) return BadRequest("from/to 参数不合法");
            DateTime fUtc = DateTime.SpecifyKind(from, DateTimeKind.Utc);
            DateTime tUtc = DateTime.SpecifyKind(to, DateTimeKind.Utc);
            List<TransmissionRecallHit> data = await _service.GetTransmissionRecallUnsoldAsync(supplier, fUtc, tUtc, ct);
            return Ok(data);
        }

        [HttpGet("transmissions/by-model")]
        public async Task<IActionResult> GetTransmissionRecallByModel([FromQuery] string supplier, [FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(supplier)) return BadRequest("supplier 不能为空");
            if (from == default || to == default || to < from) return BadRequest("from/to 参数不合法");
            DateTime fUtc = DateTime.SpecifyKind(from, DateTimeKind.Utc);
            DateTime tUtc = DateTime.SpecifyKind(to, DateTimeKind.Utc);
            List<RecallByModelDto> data = await _service.GetTransmissionRecallByModelAsync(supplier, fUtc, tUtc, ct);
            return Ok(data);
        }
    }
}
