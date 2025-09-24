using HospitalGateway.Configuration;
using HospitalGateway.Services;
using Microsoft.Extensions.Options;

namespace HospitalGateway.Middleware;

public class ProxyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly GatewayOptions _options;
    private readonly ILogger<ProxyMiddleware> _logger;

    public ProxyMiddleware(
        RequestDelegate next, 
        IOptions<GatewayOptions> options,
        ILogger<ProxyMiddleware> logger)
    {
        _next = next;
        _options = options.Value;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value;
        
        if (string.IsNullOrEmpty(path) || path == "/")
        {
            await _next(context);
            return;
        }

        // Obtener el ProxyService del contexto de la request
        var proxyService = context.RequestServices.GetRequiredService<IProxyService>();

        if (path.StartsWith("/admin", StringComparison.OrdinalIgnoreCase))
        {
            var adminPath = path.Substring("/admin".Length).TrimStart('/');
            await proxyService.ProxyRequestAsync(context, _options.AdminApiUrl, adminPath);
            return;
        }

        if (path.StartsWith("/consultas", StringComparison.OrdinalIgnoreCase))
        {
            var consultasPath = path.Substring("/consultas".Length).TrimStart('/');
            await proxyService.ProxyRequestAsync(context, _options.ConsultasApiUrl, consultasPath);
            return;
        }

        // Si no coincide con ninguna ruta de proxy, continúa con el siguiente middleware
        await _next(context);
    }
}