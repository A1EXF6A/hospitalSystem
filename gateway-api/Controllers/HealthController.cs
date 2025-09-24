using HospitalGateway.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HospitalGateway.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    private readonly GatewayOptions _options;

    public HealthController(IOptions<GatewayOptions> options)
    {
        _options = options.Value;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new 
        { 
            status = "ok", 
            gateway = ".NET",
            version = "1.0.0",
            timestamp = DateTime.UtcNow,
            services = new
            {
                adminApi = _options.AdminApiUrl,
                consultasApi = _options.ConsultasApiUrl
            }
        });
    }
}