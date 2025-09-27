# Sistema de Autenticación y Autorización - Hospital Management System

Este documento describe el sistema completo de autenticación y autorización implementado siguiendo el flujo de trabajo especificado.

## Arquitectura del Sistema de Autenticación

```
[ Cliente / Frontend ]
         |
         | 1) POST /api/auth/login (username, password)
         v
[ Gateway API (.NET) ]
    - Recibe credenciales
    - Llama a Admin API (/usuarios/validate)
         |
         | 2) POST /usuarios/validate
         v
[ Admin API - Puerto 3000 ]
    - Consulta tabla `usuarios` en DB central
      (username, password hasheado, rol, centroId)
    - Valida credenciales y rol
    - Responde con { id, role, centroId }
         |
         | 3) Respuesta: usuario válido
         v
[ Gateway API (.NET) ]
    - Genera JWT con payload:
        {
          id: <usuarioId>,
          role: <admin | medico | empleado>,
          centroId: <centro asociado o null>
        }
    - Devuelve token al cliente
         |
         | 4) Respuesta: { token }
         v
[ Cliente / Frontend ]
    - Guarda token (localStorage / memory)
    - En cada request añade:
        Authorization: Bearer <token>
         |
         | 5) GET /admin/... o /consultas/...
         v
[ Gateway API (.NET) ]
    - Reenvía request al microservicio correspondiente
    - Adjunta el header con el JWT
         |
         | 6) Microservicio recibe request
         v
[ Admin API ]                         [ Consultas API ]
- Middleware valida token              - Middleware valida token
- Solo role=admin accede               - Si role=medico → filtra por centroId
                                       - Si role=admin → acceso completo
```

## Componentes Implementados

### 1. Entidad Usuario (Admin API)

**Archivo:** `admin-api/src/entities/Usuario.ts`

```typescript
@Entity("usuarios")
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  username!: string;

  @Column({ length: 255 })
  password!: string; // Password hasheado con bcrypt

  @Column({ 
    type: "enum",
    enum: ["admin", "medico", "empleado"],
    default: "empleado"
  })
  role!: "admin" | "medico" | "empleado";

  @Column({ nullable: true })
  centroId!: number | null;

  @ManyToOne(() => Centro, { nullable: true })
  @JoinColumn({ name: "centroId" })
  centro!: Centro | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}
```

### 2. Controlador de Usuario (Admin API)

**Archivo:** `admin-api/src/controllers/usuario.controller.ts`

- `POST /usuarios/validate` - Valida credenciales y devuelve datos del usuario
- `POST /usuarios` - Crea nuevo usuario (requiere autenticación admin)
- `GET /usuarios` - Lista usuarios (requiere autenticación admin)
- `POST /usuarios/setup` - Endpoint temporal para crear el primer usuario (remover en producción)

### 3. Middleware de Autenticación (Admin API)

**Archivo:** `admin-api/src/middleware/auth.middleware.ts`

- `authenticateToken` - Valida el JWT y extrae información del usuario
- `requireAdmin` - Verifica que el usuario sea administrador

### 4. Middleware de Autenticación (Consultas API)

**Archivo:** `consultas-api/src/middleware/auth.middleware.ts`

- `authenticateToken` - Valida el JWT y extrae información del usuario
- `requireMedicoOrAdmin` - Permite acceso a médicos y administradores
- `filterByCentro` - Filtra consultas por centro para médicos

### 5. Servicios JWT (Gateway API)

**Archivo:** `gateway-api/Services/JwtService.cs`

- Generación de tokens JWT con claims personalizados
- Validación de tokens JWT
- Configuración de expiración y seguridad

### 6. Controlador de Autenticación (Gateway API)

**Archivo:** `gateway-api/Controllers/AuthController.cs`

- `POST /api/auth/login` - Endpoint de login principal
- `GET /api/auth/validate` - Validación de tokens

### 7. Middleware de Proxy (Gateway API)

**Archivo:** `gateway-api/Services/ProxyService.cs`

- Reenvía automáticamente headers de autorización a microservicios
- Manejo de errores y timeouts

## Configuración

### Variables de Entorno

**Admin API (.env.docker)**
```bash
DB_HOST=admin-db
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=admin_db
PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-key-that-must-be-at-least-32-characters-long-for-security
```

**Consultas API (.env.docker)**
```bash
DB_HOST=consultas-db
DB_PORT=3306
DB_USER=consultas
DB_PASSWORD=consultas123
DB_NAME=consultas_db
PORT=4000
NODE_ENV=production
JWT_SECRET=your-super-secret-key-that-must-be-at-least-32-characters-long-for-security
```

**Gateway API (appsettings.json)**
```json
{
  "Jwt": {
    "SecretKey": "your-super-secret-key-that-must-be-at-least-32-characters-long-for-security",
    "Issuer": "HospitalGateway",
    "Audience": "HospitalSystem"
  }
}
```

## Uso del Sistema

### 1. Configuración Inicial

1. **Iniciar servicios con Docker:**
```bash
docker-compose up -d
```

2. **Iniciar Gateway API:**
```bash
cd gateway-api
dotnet run
```

3. **Crear usuario administrador inicial:**
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/usuarios/setup" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","password":"admin123","role":"admin","centroId":null}'
```

### 2. Flujo de Autenticación

**Login:**
```bash
# Request
POST http://localhost:5158/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Acceder a endpoints protegidos:**
```bash
# Request
GET http://localhost:5158/admin/centros
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Roles y Permisos

#### Administrador (`admin`)
- Acceso completo a Admin API (`/admin/*`)
- Acceso completo a Consultas API (`/consultas/*`)
- Sin filtros por centro

#### Médico (`medico`)
- Acceso a Consultas API (`/consultas/*`)
- Filtrado automático por `centroId`
- Sin acceso a Admin API

#### Empleado (`empleado`)
- Sin acceso a ningún endpoint por defecto
- Se puede extender según necesidades

## Endpoints Disponibles

### Gateway API (Puerto 5158)

**Autenticación:**
- `POST /api/auth/login` - Login
- `GET /api/auth/validate` - Validar token

**Proxy a Admin API:**
- `GET /admin/centros` - Listar centros (admin)
- `POST /admin/centros` - Crear centro (admin)
- `GET /admin/empleados` - Listar empleados (admin)
- etc.

**Proxy a Consultas API:**
- `GET /consultas/consultas` - Listar consultas (medico/admin)
- `POST /consultas/consultas` - Crear consulta (medico/admin)
- `GET /consultas/reportes/doctor/:id` - Reportes por doctor (medico/admin)

### Admin API Directa (Puerto 3000)

**Sin autenticación:**
- `POST /usuarios/validate` - Validar credenciales
- `POST /usuarios/setup` - Crear usuario inicial (temporal)

**Con autenticación (admin):**
- Todos los endpoints de centros, empleados, especialidades, médicos, usuarios

### Consultas API Directa (Puerto 4000)

**Con autenticación (medico/admin):**
- Todos los endpoints de consultas y reportes

## Seguridad

### Características de Seguridad Implementadas

1. **Passwords hasheados** con bcrypt (10 rounds)
2. **JWT con expiración** (8 horas)
3. **Validación de token** en cada request
4. **Filtrado por centro** para médicos
5. **Headers de autorización** reenviados automáticamente
6. **Roles y permisos** granulares

### Consideraciones de Producción

1. **Remover endpoint `/usuarios/setup`**
2. **Usar HTTPS** en producción
3. **Configurar CORS** adecuadamente
4. **Rotar claves JWT** periódicamente
5. **Implementar rate limiting**
6. **Agregar logs de seguridad**

## Testing

Ejecutar el script de prueba:
```bash
powershell -ExecutionPolicy Bypass -File test-auth.ps1
```

## Troubleshooting

### Problemas Comunes

1. **Error de conexión a base de datos:**
   - Verificar que Docker esté ejecutando los contenedores
   - Revisar variables de entorno

2. **Token inválido:**
   - Verificar que JWT_SECRET sea el mismo en todos los servicios
   - Verificar formato del header: `Authorization: Bearer <token>`

3. **Acceso denegado:**
   - Verificar rol del usuario
   - Para médicos, verificar que tengan `centroId` asignado

4. **Gateway no reenvía requests:**
   - Verificar que los paths coincidan (`/admin/*`, `/consultas/*`)
   - Verificar que los servicios estén ejecutándose

Este sistema proporciona una base sólida para la autenticación y autorización en el sistema hospitalario, siguiendo las mejores prácticas de seguridad y el flujo de trabajo especificado.