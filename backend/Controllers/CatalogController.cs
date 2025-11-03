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
        public async Task<IActionResult> Models(string brand, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(brand)) return BadRequest("brand 不能为空");
            return Ok(await _svc.GetModelsByBrandNameAsync(brand, ct));
        }

        [HttpGet("colors")]
        public async Task<IActionResult> Colors(CancellationToken ct)
        {
            return Ok(await _svc.GetColorsAsync(ct));
        }

        [HttpGet("suppliers")]
        public async Task<IActionResult> Suppliers(CancellationToken ct)
        {
            return Ok(await _svc.GetSuppliersAsync(ct));
        }

        [HttpGet("transmissions")]
        public async Task<IActionResult> Transmissions(CancellationToken ct)
        {
            return Ok(await _svc.GetTransmissionsAsync(ct));
        }
    }
}
