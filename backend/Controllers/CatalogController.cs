using System.Threading;
using System.Threading.Tasks;
using carco.Services;
using Microsoft.AspNetCore.Mvc;

namespace carco.Controllers
{
    [ApiController, Route("api/[controller]")]
    public class CatalogController : ControllerBase
    {
        private readonly CatalogService _svc;
        public CatalogController(CatalogService svc) { _svc = svc; }

        [HttpGet("brands")]
        public async Task<IActionResult> Brands(CancellationToken ct)
        {
            return Ok(await _svc.GetBrandsAsync(ct));
        }

        [HttpGet("brands/{brand}/models")]
        public async Task<IActionResult> Models(string brand, [FromQuery] string? color, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(brand)) return BadRequest("brand 不能为空");
            return Ok(await _svc.GetModelsByBrandNameAsync(brand, color, ct));
        }

        [HttpGet("colors")]
        public async Task<IActionResult> Colors([FromQuery] string? brand, [FromQuery] string? model, CancellationToken ct)
        {
            return Ok(await _svc.GetColorsAsync(brand, model, ct));
        }

        [HttpGet("suppliers")]
        public async Task<IActionResult> Suppliers([FromQuery] string? brand, [FromQuery] string? model, [FromQuery] string? color, CancellationToken ct)
        {
            return Ok(await _svc.GetSuppliersAsync(brand, model, color, ct));
        }

        [HttpGet("transmissions")]
        public async Task<IActionResult> Transmissions([FromQuery] string? brand, [FromQuery] string? model, [FromQuery] string? color, CancellationToken ct)
        {
            return Ok(await _svc.GetTransmissionsAsync(brand, model, color, ct));
        }
    }
}
