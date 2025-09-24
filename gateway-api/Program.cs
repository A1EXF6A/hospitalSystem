using HospitalGateway.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Configurar servicios del gateway
builder.Services.AddGatewayServices(builder.Configuration);

// Agregar controladores para endpoints básicos
builder.Services.AddControllers();

var app = builder.Build();

// Configurar el pipeline del gateway
app.UseGateway();

// Mapear controladores
app.MapControllers();

// Log de configuración
var gatewayOptions = builder.Configuration.GetSection(GatewayOptions.SectionName).Get<GatewayOptions>() ?? new GatewayOptions();
Console.WriteLine($"🚀 Gateway .NET iniciado");
Console.WriteLine($"🌐 Puerto: {builder.Configuration["Urls"] ?? "http://localhost:5158"}");
Console.WriteLine($"🏥 Admin API: {gatewayOptions.AdminApiUrl}");
Console.WriteLine($"📋 Consultas API: {gatewayOptions.ConsultasApiUrl}");
Console.WriteLine($"⏱️  Timeout: {gatewayOptions.TimeoutSeconds}s");

app.Run();
