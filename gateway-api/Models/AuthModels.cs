namespace HospitalGateway.Models;

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
}

public class UserValidationResponse
{
    public int Id { get; set; }
    public string Role { get; set; } = string.Empty;
    public int? CentroId { get; set; }
    public string Username { get; set; } = string.Empty;
}

public class JwtTokenPayload
{
    public int Id { get; set; }
    public string Role { get; set; } = string.Empty;
    public int? CentroId { get; set; }
    public string Username { get; set; } = string.Empty;
}