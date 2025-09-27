# Admin API - Sistema Hospitalario

API de administración para el sistema hospitalario que gestiona centros médicos, empleados, especialidades, médicos y usuarios del sistema.

## 🏗️ Arquitectura

```
admin-api/
├── src/
│   ├── controllers/           # Lógica de endpoints
│   │   ├── centro.controller.ts
│   │   ├── empleado.controller.ts
│   │   ├── especialidad.controller.ts
│   │   ├── medico.controller.ts
│   │   ├── usuario.controller.ts
│   │   └── setup.controller.ts
│   ├── entities/             # Modelos de base de datos (TypeORM)
│   │   ├── Centro.ts
│   │   ├── Empleado.ts
│   │   ├── Especialidad.ts
│   │   ├── Medico.ts
│   │   └── Usuario.ts
│   ├── middleware/           # Middleware de autenticación
│   │   └── auth.middleware.ts
│   ├── routes/              # Definición de rutas
│   │   └── index.ts
│   ├── app.ts              # Configuración de Express
│   ├── data-source.ts      # Configuración de TypeORM
│   └── server.ts           # Punto de entrada
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env.example
└── .env.docker
```

## 🚀 Tecnologías

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **TypeORM** - ORM para base de datos
- **MariaDB** - Base de datos principal
- **bcrypt** - Hash de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **Swagger** - Documentación de API

## 📦 Instalación

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
npm start
```

### Docker

```bash
# Desde el directorio raíz del proyecto
docker-compose up -d admin-api
```

## 🔧 Configuración

### Variables de Entorno

```env
DB_HOST=localhost           # Host de MariaDB
DB_PORT=3306               # Puerto de MariaDB  
DB_USER=admin              # Usuario de base de datos
DB_PASSWORD=admin123       # Contraseña de base de datos
DB_NAME=admin_db           # Nombre de base de datos
PORT=3000                  # Puerto del servidor
NODE_ENV=development       # Entorno (development/production)
JWT_SECRET=your-secret-key # Clave secreta para JWT
```

### Base de Datos

La API utiliza **MariaDB** con **TypeORM**. Las entidades se sincronizan automáticamente en desarrollo (`synchronize: true`).

#### Entidades:

1. **Centro** - Centros médicos
2. **Especialidad** - Especialidades médicas
3. **Empleado** - Personal del hospital
4. **Medico** - Médicos con especialidad y centro
5. **Usuario** - Usuarios del sistema con autenticación

## 🔐 Autenticación y Autorización

### Sistema de Roles

- **admin**: Acceso completo a todos los recursos
- **medico**: Acceso limitado (futuras implementaciones)
- **empleado**: Acceso básico (futuras implementaciones)

### Middleware de Autenticación

```typescript
// Todas las rutas protegidas requieren:
router.use(authenticateToken);  // Token JWT válido
router.use(requireAdmin);       // Rol de administrador
```

### Endpoints Públicos

- `POST /setup/admin` - Crear primer usuario administrador
- `POST /usuarios/validate` - Validar credenciales de usuario

## 📍 Endpoints de la API

### Configuración Inicial

#### `POST /setup/admin`
Crear el primer usuario administrador del sistema.

```json
{
  "username": "admin",
  "password": "admin123", 
  "centroId": 1
}
```

**Respuesta:**
```json
{
  "id": 1,
  "username": "admin",
  "role": "admin", 
  "centroId": 1,
  "message": "Usuario administrador creado exitosamente"
}
```

### Autenticación

#### `POST /usuarios/validate`
Validar credenciales de usuario.

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "role": "admin",
  "centroId": 1,
  "username": "admin"
}
```

### Centros Médicos

#### `GET /centros`
Listar todos los centros médicos.

#### `POST /centros`
Crear nuevo centro médico.

```json
{
  "nombre": "Hospital General",
  "direccion": "Av. Principal 123",
  "ciudad": "Quito",
  "telefono": "02-2345678"
}
```

#### `GET /centros/:id`
Obtener centro específico por ID.

#### `PUT /centros/:id`
Actualizar centro existente.

#### `DELETE /centros/:id`
Eliminar centro médico.

### Especialidades

#### `GET /especialidades`
Listar todas las especialidades.

#### `POST /especialidades`
Crear nueva especialidad.

```json
{
  "nombre": "Cardiología",
  "descripcion": "Especialidad médica que se ocupa del corazón"
}
```

#### `GET /especialidades/:id`
Obtener especialidad específica.

#### `PUT /especialidades/:id`
Actualizar especialidad.

#### `DELETE /especialidades/:id`
Eliminar especialidad.

### Empleados

#### `GET /empleados`
Listar todos los empleados.

#### `POST /empleados`
Crear nuevo empleado.

```json
{
  "nombre": "Juan Pérez",
  "cedula": "1234567890",
  "cargo": "Enfermero",
  "centro": { "id": 1 }
}
```

#### `GET /empleados/:id`
Obtener empleado específico.

#### `PUT /empleados/:id`
Actualizar empleado.

#### `DELETE /empleados/:id`
Eliminar empleado.

### Médicos

#### `GET /medicos`
Listar todos los médicos con especialidades y centros.

#### `POST /medicos`
Crear nuevo médico.

```json
{
  "nombre": "Dra. María González",
  "cedula": "0987654321",
  "correo": "maria@hospital.com",
  "telefono": "099-123-4567",
  "especialidad": { "id": 1 },
  "centro": { "id": 1 }
}
```

#### `GET /medicos/:id`
Obtener médico específico.

#### `PUT /medicos/:id`
Actualizar médico.

#### `DELETE /medicos/:id`
Eliminar médico.

### Usuarios

#### `GET /usuarios`
Listar todos los usuarios del sistema.

#### `POST /usuarios`
Crear nuevo usuario.

```json
{
  "username": "doctor1",
  "password": "password123",
  "role": "medico",
  "centroId": 1
}
```

## 🔒 Seguridad

### Contraseñas
- Hash con **bcrypt** (10 rounds)
- Nunca se devuelven en respuestas de API

### Tokens JWT
- Duración: 8 horas
- Incluye: `id`, `role`, `centroId`, `username`
- Requerido en header: `Authorization: Bearer <token>`

### Validación
- Campos requeridos validados
- Username único
- Manejo de errores consistente

## 📖 Documentación

### Swagger/OpenAPI
Disponible en: `http://localhost:3000/docs`

La documentación interactiva incluye:
- Esquemas de datos
- Ejemplos de requests/responses
- Testing interactivo

## 🐛 Manejo de Errores

### Códigos de Estado HTTP

- **200** - Éxito
- **201** - Recurso creado
- **400** - Datos inválidos
- **401** - No autenticado
- **403** - Sin permisos
- **404** - Recurso no encontrado
- **500** - Error interno del servidor

### Formato de Errores

```json
{
  "message": "Descripción del error",
  "error": "Detalles técnicos (solo en desarrollo)"
}
```

## 📝 Scripts NPM

```bash
# Desarrollo con auto-reload
npm run dev

# Construir TypeScript
npm run build

# Ejecutar en producción
npm start

# Comandos de TypeORM
npm run typeorm
```

## 🔍 Logging y Debugging

### Logs Incluidos
- Operaciones de base de datos (TypeORM logging)
- Errores no manejados
- Información de arranque del servidor

### Configuración de Logs
```typescript
// En data-source.ts
logging: true  // Solo en desarrollo
```

## 🧪 Testing

### Ejemplos con cURL

```bash
# Crear centro médico
curl -X POST http://localhost:3000/centros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"nombre":"Hospital Test","ciudad":"Quito"}'

# Listar centros
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/centros
```

### Testing con Postman
1. Importar la colección desde Swagger
2. Configurar token JWT en Authorization
3. Usar variables de entorno para host/port

## 🚧 Desarrollo

### Estructura de Desarrollo
```bash
# Directorio de trabajo
cd admin-api

# Instalar dependencias
npm install

# Modo desarrollo (auto-reload)
npm run dev

# Ver logs de base de datos
# Los logs aparecen en consola con TypeORM logging
```

### Agregar Nueva Funcionalidad

1. **Nueva Entidad**: Crear en `src/entities/`
2. **Controller**: Implementar CRUD en `src/controllers/`
3. **Rutas**: Agregar en `src/routes/index.ts`
4. **Middleware**: Si requiere permisos especiales

## 🔄 Mantenimiento

### Backup de Base de Datos
```bash
# Con Docker
docker exec admin-db mysqldump -u admin -p admin_db > backup.sql

# Restaurar
docker exec -i admin-db mysql -u admin -p admin_db < backup.sql
```

### Monitoreo
- Health check: Endpoint básico disponible
- Logs de aplicación via console
- Monitoring de base de datos via TypeORM logging

## 📞 Soporte

Para soporte y reporte de issues:
1. Revisar logs de aplicación
2. Verificar configuración de base de datos
3. Validar variables de entorno
4. Consultar documentación de Swagger

---

**Nota**: Esta API forma parte del sistema hospitalario completo. Para funcionamiento completo, ejecutar junto con Consultas API y Frontend.