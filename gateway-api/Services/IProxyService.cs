namespace HospitalGateway.Services;

public interface IProxyService
{
    Task ProxyRequestAsync(HttpContext context, string targetBaseUrl, string? path);
}