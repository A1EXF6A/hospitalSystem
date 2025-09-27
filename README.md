# Hospital Management System

Sistema de gestión hospitalaria construido con microservicios usando Node.js, TypeScript, Express y TypeORM.

## Arquitectura del Sistema

El sistema está compuesto por servicios principales:

- **Admin API** (Puerto 3000): Gestión de centros, empleados, especialidades y médicos
- **Consultas API** (Puerto 4000): Gestión de consultas médicas y reportes
- **Gateway .NET** (Puerto 5000): Gateway construido con .NET 8

## Tecnologías Utilizadas

- **Backend**: Node.js, TypeScript, Express.js
- **ORM**: TypeORM
- **Base de Datos**: MariaDB
- **Contenedores**: Docker & Docker Compose
- **Documentación**: Swagger/OpenAPI
 
## Estructura del Proyecto

```
hospital-system/
├── admin-api/              # API de administración
│   ├── src/
│   │   ├── controllers/    # Controladores de endpoints
│   │   ├── entities/       # Entidades de base de datos
│   │   └── routes/         # Definición de rutas
│   ├── Dockerfile
│   └── package.json
├── consultas-api/          # API de consultas
│   ├── src/
│   │   ├── controllers/
│   │   ├── entities/
│   │   └── routes/
│   ├── Dockerfile
│   └── package.json
├── gateway-api/            # Gateway .NET
│   ├── Program.cs
│   ├── gateway-api.csproj
│   └── appsettings.json
└── docker-compose.yml      # Configuración de contenedores
```

## Instalación y Configuración

### Opción 1: Usando Docker (Recomendado para producción)

#### Prerrequisitos
- Docker
- Docker Compose

#### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd hospital-system
```

2. **Configurar variables de entorno**

Los archivos `.env.docker` ya están configurados para el entorno Docker. No necesitas modificarlos.

3. **Ejecutar el sistema**
```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d --build
```

4. **Verificar que los servicios estén funcionando**
```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs
docker logs admin-api
docker logs consultas-api
```

#### Endpoints disponibles con Docker

- **Admin API directa**: http://localhost:3000
- **Consultas API directa**: http://localhost:4000
- **Documentación Swagger**:
  - Admin API: http://localhost:3000/docs
  - Consultas API: http://localhost:4000/docs

### Opción 2: Ejecución Local (Recomendado para desarrollo)

#### Prerrequisitos
- Node.js (v18 o superior)
- npm
- MariaDB Server

#### Pasos de instalación

1. **Configurar MariaDB**

Crear las bases de datos necesarias:
```sql
CREATE DATABASE admin_db;
CREATE DATABASE consultas_db;
```

2. **Configurar variables de entorno**

Crear archivos `.env` en cada servicio:

**admin-api/.env**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=admin_db
PORT=3000
NODE_ENV=development
```

**consultas-api/.env**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=consultas_db
PORT=4000
NODE_ENV=development
```



3. **Instalar dependencias y ejecutar cada servicio**

**Terminal 1 - Admin API:**
```bash
cd admin-api
npm install
npm run dev
```

**Terminal 2 - Consultas API:**
```bash
cd consultas-api
npm install
npm run dev
```

**Terminal 3 - Gateway (.NET):**
```bash
cd gateway-api
dotnet restore
dotnet run
```

#### Endpoints disponibles en local

- **Gateway .NET**: http://localhost:5000
- **Admin API**: http://localhost:3000
- **Consultas API**: http://localhost:4000
- **Documentación Swagger**:
  - Admin API: http://localhost:3000/docs
  - Consultas API: http://localhost:4000/docs

## API Endpoints

### Admin API

#### Centros Médicos
- `GET /centros` - Listar todos los centros
- `GET /centros/:id` - Obtener centro específico
- `POST /centros` - Crear nuevo centro
- `PUT /centros/:id` - Actualizar centro
- `DELETE /centros/:id` - Eliminar centro

#### Especialidades
- `GET /especialidades` - Listar especialidades
- `GET /especialidades/:id` - Obtener especialidad específica
- `POST /especialidades` - Crear especialidad
- `PUT /especialidades/:id` - Actualizar especialidad
- `DELETE /especialidades/:id` - Eliminar especialidad

#### Empleados
- `GET /empleados` - Listar empleados
- `GET /empleados/:id` - Obtener empleado específico
- `POST /empleados` - Crear empleado
- `PUT /empleados/:id` - Actualizar empleado
- `DELETE /empleados/:id` - Eliminar empleado

#### Médicos
- `GET /medicos` - Listar médicos
- `GET /medicos/:id` - Obtener médico específico
- `POST /medicos` - Crear médico
- `PUT /medicos/:id` - Actualizar médico
- `DELETE /medicos/:id` - Eliminar médico

### Consultas API

#### Consultas Médicas
- `GET /consultas` - Listar consultas
- `GET /consultas/:id` - Obtener consulta específica
- `POST /consultas` - Crear consulta
- `PUT /consultas/:id` - Actualizar consulta
- `DELETE /consultas/:id` - Eliminar consulta

#### Reportes
- `GET /reportes/doctor/:doctorId` - Reporte de consultas por médico
  - Query params: `from`, `to` (fechas)

## Ejemplos de Uso

### Crear un Centro Médico (usando Gateway .NET)
```bash
curl -X POST http://localhost:5000/admin/centros \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Hospital General",
    "direccion": "Av. Principal 123",
    "ciudad": "Quito",
    "telefono": "0999999999"
  }'
```

### Crear una Consulta (usando Gateway .NET)
```bash
curl -X POST http://localhost:5000/consultas/consultas \
  -H "Content-Type: application/json" \
  -d '{
    "paciente": "Juan Pérez",
    "doctorId": 1,
    "centroId": 1,
    "fecha": "2025-09-22T10:00:00",
    "notas": "Consulta de rutina",
    "estado": "programada"
  }'
```

## Comandos Útiles

### Docker
```bash
# Detener todos los servicios
docker-compose down

# Ver logs en tiempo real
docker-compose logs -f

# Reconstruir un servicio específico
docker-compose up --build <servicio>

# Ejecutar comando en contenedor
docker exec -it <container-name> bash
```

### Desarrollo Local
```bash
# Instalar dependencias en todos los servicios
npm run install:all

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar pruebas
npm test
```

## Estructura de Base de Datos

### Admin DB
- **centros**: Información de centros médicos
- **especialidades**: Especialidades médicas disponibles
- **empleados**: Personal del hospital
- **medicos**: Médicos con sus especialidades y centros

### Consultas DB
- **consultas**: Registros de consultas médicas

## Troubleshooting

### Problemas Comunes con Docker

1. **Error de conexión a base de datos**
   - Verificar que los contenedores de MariaDB estén ejecutándose
   - Revisar las variables de entorno en archivos `.env.docker`

2. **Puerto ya en uso**
   - Cambiar los puertos en `docker-compose.yml`
   - O detener el servicio que esté usando el puerto

3. **Problemas de proxy en Gateway**
   - Para desarrollo, usar las APIs directamente en puertos 3000 y 4000
   - El gateway funciona mejor en entorno local que en Docker

### Problemas Comunes en Local

1. **MariaDB no conecta**
   - Verificar que MariaDB esté ejecutándose
   - Revisar credenciales en archivos `.env`
   - Verificar que las bases de datos existan

2. **Puerto ya en uso**
   - Cambiar el puerto en el archivo `.env` correspondiente

## Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.