using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Configurar servicios
builder.Services.AddHttpClient();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configurar timeout para HttpClient
builder.Services.ConfigureHttpClientDefaults(options =>
{
    options.ConfigureHttpClient(httpClient =>
    {
        httpClient.Timeout = TimeSpan.FromSeconds(60);
    });
});

var app = builder.Build();

// Configurar CORS
app.UseCors();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "ok", gateway = ".NET" }));

// URLs de las APIs (configurables por environment variables)
var adminApiUrl = Environment.GetEnvironmentVariable("ADMIN_API_URL") ?? "http://localhost:3000";
var consultasApiUrl = Environment.GetEnvironmentVariable("CONSULTAS_API_URL") ?? "http://localhost:4000";

// Configurar proxy para Admin API
app.Map("/admin/{**path}", async (HttpContext context, IHttpClientFactory httpClientFactory, string? path) =>
{
    var httpClient = httpClientFactory.CreateClient();
    var targetUrl = $"{adminApiUrl}/{path ?? ""}";
    
    // Agregar query parameters si existen
    if (context.Request.QueryString.HasValue)
    {
        targetUrl += context.Request.QueryString.Value;
    }

    try
    {
        // Crear la request al servicio destino
        var requestMessage = new HttpRequestMessage();
        requestMessage.Method = new HttpMethod(context.Request.Method);
        requestMessage.RequestUri = new Uri(targetUrl);

        // Copiar headers (excepto algunos que pueden causar problemas)
        foreach (var header in context.Request.Headers)
        {
            if (!header.Key.Equals("Host", StringComparison.OrdinalIgnoreCase) &&
                !header.Key.Equals("Content-Length", StringComparison.OrdinalIgnoreCase))
            {
                requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }

        // Copiar el body para métodos que lo requieren
        if (context.Request.Method != "GET" && context.Request.Method != "DELETE" && 
            context.Request.ContentLength > 0)
        {
            requestMessage.Content = new StreamContent(context.Request.Body);
            if (context.Request.ContentType != null)
            {
                requestMessage.Content.Headers.ContentType = 
                    System.Net.Http.Headers.MediaTypeHeaderValue.Parse(context.Request.ContentType);
            }
        }

        // Enviar request
        var response = await httpClient.SendAsync(requestMessage);

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
    catch (Exception ex)
    {
        context.Response.StatusCode = 503;
        await context.Response.WriteAsync(JsonSerializer.Serialize(new 
        { 
            message = "Servicio admin-api no disponible",
            error = ex.Message 
        }));
    }
});

// Configurar proxy para Consultas API
app.Map("/consultas/{**path}", async (HttpContext context, IHttpClientFactory httpClientFactory, string? path) =>
{
    var httpClient = httpClientFactory.CreateClient();
    var targetUrl = $"{consultasApiUrl}/{path ?? ""}";
    
    // Agregar query parameters si existen
    if (context.Request.QueryString.HasValue)
    {
        targetUrl += context.Request.QueryString.Value;
    }

    try
    {
        // Crear la request al servicio destino
        var requestMessage = new HttpRequestMessage();
        requestMessage.Method = new HttpMethod(context.Request.Method);
        requestMessage.RequestUri = new Uri(targetUrl);

        // Copiar headers (excepto algunos que pueden causar problemas)
        foreach (var header in context.Request.Headers)
        {
            if (!header.Key.Equals("Host", StringComparison.OrdinalIgnoreCase) &&
                !header.Key.Equals("Content-Length", StringComparison.OrdinalIgnoreCase))
            {
                requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }

        // Copiar el body para métodos que lo requieren
        if (context.Request.Method != "GET" && context.Request.Method != "DELETE" && 
            context.Request.ContentLength > 0)
        {
            requestMessage.Content = new StreamContent(context.Request.Body);
            if (context.Request.ContentType != null)
            {
                requestMessage.Content.Headers.ContentType = 
                    System.Net.Http.Headers.MediaTypeHeaderValue.Parse(context.Request.ContentType);
            }
        }

        // Enviar request
        var response = await httpClient.SendAsync(requestMessage);

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
    catch (Exception ex)
    {
        context.Response.StatusCode = 503;
        await context.Response.WriteAsync(JsonSerializer.Serialize(new 
        { 
            message = "Servicio consultas-api no disponible",
            error = ex.Message 
        }));
    }
});

// Log de configuración
Console.WriteLine($"Gateway .NET iniciado en puerto: {builder.Configuration["ASPNETCORE_URLS"] ?? "http://localhost:5000"}");
Console.WriteLine($"Admin API URL: {adminApiUrl}");
Console.WriteLine($"Consultas API URL: {consultasApiUrl}");

app.Run();
