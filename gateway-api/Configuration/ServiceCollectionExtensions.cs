using HospitalGateway.Configuration;
using HospitalGateway.Middleware;
using HospitalGateway.Services;

namespace HospitalGateway.Configuration;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddGatewayServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configurar opciones
        services.Configure<GatewayOptions>(configuration.GetSection(GatewayOptions.SectionName));

        // Registrar servicios
        services.AddScoped<IProxyService, ProxyService>();

        // Configurar HttpClient
        services.AddHttpClient();
        services.ConfigureHttpClientDefaults(options =>
        {
            options.ConfigureHttpClient(httpClient =>
            {
                var gatewayOptions = configuration.GetSection(GatewayOptions.SectionName).Get<GatewayOptions>() ?? new GatewayOptions();
                httpClient.Timeout = TimeSpan.FromSeconds(gatewayOptions.TimeoutSeconds);
            });
        });

        // Configurar CORS
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        return services;
    }
}

public static class WebApplicationExtensions
{
    public static WebApplication UseGateway(this WebApplication app)
    {
        // Configurar CORS
        app.UseCors();

        // Agregar middleware de proxy
        app.UseMiddleware<ProxyMiddleware>();

        return app;
    }
}