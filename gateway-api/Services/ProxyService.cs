using System.Text.Json;

namespace HospitalGateway.Services;

public class ProxyService : IProxyService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ProxyService> _logger;

    public ProxyService(IHttpClientFactory httpClientFactory, ILogger<ProxyService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task ProxyRequestAsync(HttpContext context, string targetBaseUrl, string? path)
    {
        var httpClient = _httpClientFactory.CreateClient();
        var targetUrl = $"{targetBaseUrl}/{path ?? ""}";

        // Agregar query parameters si existen
        if (context.Request.QueryString.HasValue)
        {
            targetUrl += context.Request.QueryString.Value;
        }

        _logger.LogInformation("Proxying request: {Method} {TargetUrl}", context.Request.Method, targetUrl);

        try
        {
            var requestMessage = await CreateRequestMessageAsync(context, targetUrl);
            var response = await httpClient.SendAsync(requestMessage);
            await CopyResponseAsync(response, context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error proxying request to {TargetUrl}", targetUrl);
            await HandleProxyErrorAsync(context, ex, targetBaseUrl);
        }
    }

    private async Task<HttpRequestMessage> CreateRequestMessageAsync(HttpContext context, string targetUrl)
    {
        var requestMessage = new HttpRequestMessage
        {
            Method = new HttpMethod(context.Request.Method),
            RequestUri = new Uri(targetUrl)
        };

        // Copiar headers (excepto algunos que pueden causar problemas)
        await CopyRequestHeadersAsync(context, requestMessage);

        // Copiar el body para métodos que lo requieren
        await CopyRequestBodyAsync(context, requestMessage);

        return requestMessage;
    }

    private Task CopyRequestHeadersAsync(HttpContext context, HttpRequestMessage requestMessage)
    {
        foreach (var header in context.Request.Headers)
        {
            if (ShouldCopyHeader(header.Key))
            {
                requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }
        return Task.CompletedTask;
    }

    private async Task CopyRequestBodyAsync(HttpContext context, HttpRequestMessage requestMessage)
    {
        if (HasBody(context.Request.Method) && context.Request.ContentLength > 0)
        {
            var memoryStream = new MemoryStream();
            await context.Request.Body.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            requestMessage.Content = new StreamContent(memoryStream);
            
            if (context.Request.ContentType != null)
            {
                requestMessage.Content.Headers.ContentType = 
                    System.Net.Http.Headers.MediaTypeHeaderValue.Parse(context.Request.ContentType);
            }
        }
    }

    private async Task CopyResponseAsync(HttpResponseMessage response, HttpContext context)
    {
        // Copiar status code
        context.Response.StatusCode = (int)response.StatusCode;

        // Copiar response headers
        foreach (var header in response.Headers)
        {
            context.Response.Headers[header.Key] = header.Value.ToArray();
        }

        foreach (var header in response.Content.Headers)
        {
            context.Response.Headers[header.Key] = header.Value.ToArray();
        }

        // Copiar response body
        await response.Content.CopyToAsync(context.Response.Body);
    }

    private async Task HandleProxyErrorAsync(HttpContext context, Exception ex, string targetService)
    {
        context.Response.StatusCode = 503;
        await context.Response.WriteAsync(JsonSerializer.Serialize(new 
        { 
            message = $"Servicio {GetServiceName(targetService)} no disponible",
            error = ex.Message,
            timestamp = DateTime.UtcNow
        }));
    }

    private bool ShouldCopyHeader(string headerName)
    {
        var headersToSkip = new[] { "Host", "Content-Length", "Transfer-Encoding" };
        return !headersToSkip.Contains(headerName, StringComparer.OrdinalIgnoreCase);
    }

    private bool HasBody(string method)
    {
        var methodsWithBody = new[] { "POST", "PUT", "PATCH" };
        return methodsWithBody.Contains(method, StringComparer.OrdinalIgnoreCase);
    }

    private string GetServiceName(string targetUrl)
    {
        if (targetUrl.Contains("3000")) return "admin-api";
        if (targetUrl.Contains("4000")) return "consultas-api";
        return "unknown";
    }
}