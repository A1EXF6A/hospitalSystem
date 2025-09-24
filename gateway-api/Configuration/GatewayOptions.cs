namespace HospitalGateway.Configuration;

public class GatewayOptions
{
    public const string SectionName = "Gateway";
    
    public string AdminApiUrl { get; set; } = "http://localhost:3000";
    public string ConsultasApiUrl { get; set; } = "http://localhost:4000";
    public int TimeoutSeconds { get; set; } = 60;
    public bool EnableLogging { get; set; } = true;
}