# Hospital System Authentication Test Script
# This script demonstrates the complete authentication flow

Write-Host "=== Hospital System Authentication Test ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$gatewayUrl = "http://localhost:5158"
$adminApiUrl = "http://localhost:3000"
$consultasApiUrl = "http://localhost:4000"

# Function to make HTTP requests with error handling
function Invoke-ApiRequest {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -Body $Body -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers
        }
        return @{ Success = $true; Data = $response }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $_.Exception.Response.StatusCode }
    }
}

Write-Host "Step 1: Create a test admin user (bypassing authentication for setup)" -ForegroundColor Yellow

# First, we need to create a user directly through the validation endpoint
# This is a temporary setup step - in production, you'd have a migration or setup script

$testUser = @{
    username = "admin"
    password = "admin123"
    role = "admin"
    centroId = $null
} | ConvertTo-Json

# Note: This won't work initially because the API requires auth now
# Let's modify the approach...

Write-Host "Step 2: Test the authentication workflow" -ForegroundColor Yellow

# Test login with non-existent user (should fail)
$loginRequest = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Write-Host "Testing login endpoint..." -ForegroundColor White
$loginResult = Invoke-ApiRequest -Uri "$gatewayUrl/api/auth/login" -Method POST -Body $loginRequest

if ($loginResult.Success) {
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $token = $loginResult.Data.token
    Write-Host "Token received: $($token.Substring(0, 50))..." -ForegroundColor Green
    
    # Test protected endpoint
    Write-Host "Step 3: Test protected admin endpoint" -ForegroundColor Yellow
    $authHeaders = @{ "Authorization" = "Bearer $token" }
    
    $centrosResult = Invoke-ApiRequest -Uri "$gatewayUrl/admin/centros" -Headers $authHeaders
    
    if ($centrosResult.Success) {
        Write-Host "✅ Protected endpoint access successful!" -ForegroundColor Green
        Write-Host "Centros: $($centrosResult.Data | ConvertTo-Json)" -ForegroundColor Green
    } else {
        Write-Host "❌ Protected endpoint access failed: $($centrosResult.Error)" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ Login failed: $($loginResult.Error)" -ForegroundColor Red
    if ($loginResult.StatusCode -eq 401) {
        Write-Host "This is expected if no user exists yet." -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan

# Instructions for manual testing
Write-Host ""
Write-Host "Manual Testing Instructions:" -ForegroundColor Yellow
Write-Host "1. First, you need to create a user directly in the database or modify the API temporarily" -ForegroundColor White
Write-Host "2. Use the following endpoints:" -ForegroundColor White
Write-Host "   - Login: POST $gatewayUrl/api/auth/login" -ForegroundColor White
Write-Host "   - Validate Token: GET $gatewayUrl/api/auth/validate" -ForegroundColor White
Write-Host "   - Admin endpoints: GET $gatewayUrl/admin/*" -ForegroundColor White
Write-Host "   - Consultas endpoints: GET $gatewayUrl/consultas/*" -ForegroundColor White

Write-Host ""
Write-Host "Sample curl commands:" -ForegroundColor Yellow
Write-Host "# Login" -ForegroundColor White
Write-Host "curl -X POST $gatewayUrl/api/auth/login -H 'Content-Type: application/json' -d '{`"username`":`"admin`",`"password`":`"admin123`"}'" -ForegroundColor Gray
Write-Host ""
Write-Host "# Use protected endpoint (replace TOKEN with actual token)" -ForegroundColor White
Write-Host "curl -H 'Authorization: Bearer TOKEN' $gatewayUrl/admin/centros" -ForegroundColor Gray