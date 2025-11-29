using Microsoft.AspNetCore.Mvc;
using HospitalGateway.Models;
using HospitalGateway.Services;
using System.Text.Json;
using System.Text;

namespace HospitalGateway.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthController> _logger;
    private readonly IConfiguration _configuration;

    public AuthController(
        IHttpClientFactory httpClientFactory,
        IJwtService jwtService,
        ILogger<AuthController> logger,
        IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _jwtService = jwtService;
        _logger = logger;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username y password son requeridos" });
            }

            // Call Admin API to validate user
            var adminApiUrl = _configuration["Gateway:AdminApiUrl"] ?? "http://localhost:3000";
            var httpClient = _httpClientFactory.CreateClient();

            var validationRequest = new
            {
                username = request.Username,
                password = request.Password
            };

            var jsonContent = JsonSerializer.Serialize(validationRequest);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync($"{adminApiUrl}/usuarios/validate", content);

            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    return Unauthorized(new { message = "Credenciales inválidas" });
                }

                _logger.LogError($"Error calling Admin API: {response.StatusCode}");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var userValidation = JsonSerializer.Deserialize<UserValidationResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (userValidation == null)
            {
                return StatusCode(500, new { message = "Error procesando respuesta del servidor" });
            }

            // Generate JWT token
            var token = _jwtService.GenerateToken(userValidation);

            return Ok(new LoginResponse { Token = token });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("validate")]
    public IActionResult ValidateToken()
    {
        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        if (authHeader == null || !authHeader.StartsWith("Bearer "))
        {
            return Unauthorized(new { message = "Token no proporcionado" });
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();

        try
        {
            var principal = _jwtService.ValidateToken(token);
            
            var userId = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var username = principal.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var role = principal.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var centroIdClaim = principal.FindFirst("centroId")?.Value;
            var doctorIdClaim = principal.FindFirst("doctorId")?.Value;
            
            int? centroId = null;
            if (int.TryParse(centroIdClaim, out var parsedCentroId))
            {
                centroId = parsedCentroId;
            }
            
            int? doctorId = null;
            if (int.TryParse(doctorIdClaim, out var parsedDoctorId))
            {
                doctorId = parsedDoctorId;
            }

            return Ok(new
            {
                id = userId,
                username,
                role,
                centroId,
                doctorId,
                valid = true
            });
        }
        catch
        {
            return Unauthorized(new { message = "Token inválido" });
        }
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Credential))
            {
                return BadRequest(new { message = "Token de Google es requerido" });
            }

            // Call Admin API to validate Google user
            var adminApiUrl = _configuration["Gateway:AdminApiUrl"] ?? "http://localhost:3000";
            var httpClient = _httpClientFactory.CreateClient();

            var googleRequest = new
            {
                credential = request.Credential
            };

            var jsonContent = JsonSerializer.Serialize(googleRequest);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync($"{adminApiUrl}/usuarios/google-login", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                
                if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    try
                    {
                        var errorResponse = JsonSerializer.Deserialize<GoogleLoginErrorResponse>(errorContent, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });
                        
                        return Unauthorized(new { 
                            message = errorResponse?.Message ?? "Usuario no registrado",
                            userInfo = errorResponse?.UserInfo
                        });
                    }
                    catch
                    {
                        return Unauthorized(new { message = "Usuario no registrado" });
                    }
                }

                _logger.LogError($"Error calling Admin API for Google login: {response.StatusCode} - {errorContent}");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var userValidation = JsonSerializer.Deserialize<UserValidationResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (userValidation == null)
            {
                return StatusCode(500, new { message = "Error procesando respuesta del servidor" });
            }

            // Generate JWT token
            var token = _jwtService.GenerateToken(userValidation);

            return Ok(new LoginResponse { Token = token });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Google login");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }
}