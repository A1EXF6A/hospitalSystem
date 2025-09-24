# Gateway API .NET

Gateway construido en .NET 8 para el sistema hospitalario.

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

El gateway se ejecuta por defecto en el puerto 5000 y se conecta a:
- Admin API: http://localhost:3000
- Consultas API: http://localhost:4000

## Endpoints

- `GET /health` - Health check del gateway
- `/admin/*` - Proxy a Admin API
- `/consultas/*` - Proxy a Consultas API

## Variables de entorno

- `ADMIN_API_URL` - URL de la Admin API (default: http://localhost:3000)
- `CONSULTAS_API_URL` - URL de la Consultas API (default: http://localhost:4000)
- `ASPNETCORE_URLS` - URL donde escucha el gateway (default: http://localhost:5000)

## Ejemplos de uso

```bash
# Health check
curl http://localhost:5000/health

# Listar centros través del gateway
curl http://localhost:5000/admin/centros

# Crear centro través del gateway
curl -X POST http://localhost:5000/admin/centros \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Centro Test","direccion":"Av. Test 123","ciudad":"Quito","telefono":"0999999999"}'

# Listar consultas través del gateway
curl http://localhost:5000/consultas/consultas
```