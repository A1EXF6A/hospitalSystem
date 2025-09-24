# Gateway API .NET

Gateway construido en .NET 8 con arquitectura limpia y desacoplada para el sistema hospitalario.

## Arquitectura

```
gateway-api/
├── Controllers/           # Controladores (Health, etc.)
├── Services/             # Lógica de negocio (ProxyService)
├── Middleware/           # Middleware personalizado (ProxyMiddleware)
├── Configuration/        # Configuración y extensiones
├── Program.cs           # Punto de entrada simplificado
└── appsettings.json     # Configuración de la aplicación
```

## Características

- ✅ **Arquitectura limpia** - Separación de responsabilidades
- ✅ **Configuración flexible** - Via appsettings.json y variables de entorno
- ✅ **Logging integrado** - Logs detallados para debugging
- ✅ **Manejo de errores robusto** - Respuestas consistentes en caso de fallas
- ✅ **Inyección de dependencias** - Testeable y mantenible
- ✅ **Timeout configurable** - Control de tiempos de respuesta

## Ejecutar localmente

```bash
# Navegar a la carpeta
cd gateway-api

# Restaurar paquetes NuGet
dotnet restore

# Ejecutar en modo desarrollo
dotnet run

# O usar watch para auto-reload
dotnet watch run
```

## Configuración

### appsettings.json
```json
{
  "Gateway": {
    "AdminApiUrl": "http://localhost:3000",
    "ConsultasApiUrl": "http://localhost:4000",
    "TimeoutSeconds": 60,
    "EnableLogging": true
  }
}
```

### Variables de entorno (sobrescriben appsettings.json)
- `Gateway__AdminApiUrl` - URL de la Admin API
- `Gateway__ConsultasApiUrl` - URL de la Consultas API
- `Gateway__TimeoutSeconds` - Timeout en segundos
- `ASPNETCORE_URLS` - URL donde escucha el gateway

## Endpoints

- `GET /health` - Health check completo del gateway
- `/admin/*` - Proxy a Admin API
- `/consultas/*` - Proxy a Consultas API

## Ejemplos de uso

```bash
# Health check (incluye información de servicios)
curl http://localhost:5158/health

# Listar centros través del gateway
curl http://localhost:5158/admin/centros

# Crear centro través del gateway
curl -X POST http://localhost:5158/admin/centros \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Centro Test","direccion":"Av. Test 123","ciudad":"Quito","telefono":"0999999999"}'

# Listar consultas través del gateway
curl http://localhost:5158/consultas/consultas

# Crear consulta través del gateway
curl -X POST http://localhost:5158/consultas/consultas \
  -H "Content-Type: application/json" \
  -d '{"paciente":"Test Patient","doctorId":1,"centroId":1,"fecha":"2025-09-25T10:00:00","notas":"Test","estado":"programada"}'
```

## Desarrollo

### Agregar nuevos servicios

1. Actualizar `GatewayOptions.cs` con la nueva URL
2. Modificar `ProxyMiddleware.cs` para agregar el nuevo path
3. Actualizar `appsettings.json` con la configuración

### Testing

```bash
# Ejecutar tests (cuando se agreguen)
dotnet test

# Verificar cobertura de código
dotnet test --collect:"XPlat Code Coverage"
```

## Logging

El gateway incluye logging detallado:
- Requests entrantes
- Respuestas de servicios backend  
- Errores y excepciones
- Métricas de performance

Los logs se pueden configurar en `appsettings.json` bajo la sección `Logging`.