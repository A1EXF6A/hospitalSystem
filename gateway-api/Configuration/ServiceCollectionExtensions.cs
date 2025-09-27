using HospitalGateway.Configuration;
using HospitalGateway.Middleware;
using HospitalGateway.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace HospitalGateway.Configuration;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddGatewayServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configurar opciones
        services.Configure<GatewayOptions>(configuration.GetSection(GatewayOptions.SectionName));

        // Registrar servicios
        services.AddScoped<IProxyService, ProxyService>();
        services.AddScoped<IJwtService, JwtService>();

        // Configurar JWT Authentication
        var jwtSecretKey = configuration["Jwt:SecretKey"] ?? "your-super-secret-key-that-must-be-at-least-32-characters-long-for-security";
        var jwtIssuer = configuration["Jwt:Issuer"] ?? "HospitalGateway";
        var jwtAudience = configuration["Jwt:Audience"] ?? "HospitalSystem";

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecretKey)),
                    ValidateIssuer = true,
                    ValidIssuer = jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = jwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.AddAuthorization();

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

        // Configurar autenticación y autorización
        app.UseAuthentication();
        app.UseAuthorization();

        // Agregar middleware de proxy
        app.UseMiddleware<ProxyMiddleware>();

        return app;
    }
}