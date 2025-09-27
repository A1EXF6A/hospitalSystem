# 🏥 Sistema de Gestión Hospitalaria

Sistema completo de gestión hospitalaria construido con arquitectura de microservicios, utilizando Node.js, TypeScript, React y .NET. Diseñado para la administración integral de centros médicos, personal, consultas y reportes.

## 🏗️ Arquitectura del Sistema

El sistema implementa una arquitectura de microservicios completamente funcional:

```mermaid
graph TB
    A[🌐 Frontend React] --> B[🔀 Gateway .NET]
    A --> C[⚕️ Admin API]
    A --> D[📋 Consultas API]
    B --> C
    B --> D
    C --> E[🗄️ Admin DB]
    D --> F[🗄️ Consultas DB]
    
    style A fill:#61dafb
    style B fill:#512bd4
    style C fill:#339933
    style D fill:#339933
    style E fill:#003545
    style F fill:#003545
```

### Componentes Principales

| Servicio | Puerto | Tecnología | Propósito |
|----------|--------|------------|-----------|
| **🌐 Frontend** | 3001 | React + TypeScript | Interfaz de usuario responsive |
| **🔀 Gateway API** | 5158 | .NET 8 | Punto de entrada unificado y autenticación |
| **⚕️ Admin API** | 3000 | Node.js + TypeScript | Gestión de centros, personal y usuarios |
| **📋 Consultas API** | 4000 | Node.js + TypeScript | Gestión de consultas médicas y reportes |

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js 20** + **TypeScript** - Runtime y tipado estático
- **Express.js** - Framework web minimalista
- **TypeORM** - ORM para TypeScript con soporte a migraciones
- **.NET 8** - Gateway de alta performance
- **MariaDB 10.11** - Base de datos relacional
- **JWT** - Autenticación stateless
- **bcrypt** - Hash seguro de contraseñas

### Frontend
- **React 19** + **TypeScript** - Interfaz de usuario moderna
- **React Router DOM** - Navegación SPA
- **Axios** - Cliente HTTP con interceptores
- **Context API** - Manejo de estado global

### DevOps & Herramientas
- **Docker & Docker Compose** - Contenedores y orquestación
- **Swagger/OpenAPI** - Documentación automática de APIs
- **ESLint + Prettier** - Linting y formateo de código

## 📁 Estructura del Proyecto

```
hospitalSystem/
├── 📚 README.md                    # Documentación principal
├── 🐳 docker-compose.yml           # Orquestación de contenedores
├── 
├── 🏥 admin-api/                   # API de Administración
│   ├── 📚 README.md                # Documentación específica
│   ├── 📦 package.json
│   ├── 📋 tsconfig.json
│   ├── 🐳 Dockerfile
│   ├── ⚙️ .env.example
│   └── 📂 src/
│       ├── 🎮 controllers/         # Lógica de endpoints
│       ├── 🗃️ entities/            # Modelos de base de datos
│       ├── 🛡️ middleware/          # Autenticación y validación
│       ├── 🛤️ routes/              # Definición de rutas
│       ├── ⚙️ app.ts               # Configuración de Express
│       ├── 🗄️ data-source.ts       # Configuración de TypeORM
│       └── 🚀 server.ts            # Punto de entrada
│
├── 📋 consultas-api/               # API de Consultas Médicas
│   ├── 📚 README.md
│   ├── 📦 package.json
│   ├── 📋 tsconfig.json
│   ├── 🐳 Dockerfile
│   ├── ⚙️ .env.example
│   └── 📂 src/
│       ├── 🎮 controllers/
│       ├── 🗃️ entities/
│       ├── 🛡️ middleware/
│       ├── 🛤️ routes/
│       └── ... (estructura similar)
│
├── 🔀 gateway-api/                 # Gateway .NET
│   ├── 📚 README.md
│   ├── 📦 gateway-api.csproj
│   ├── ⚙️ appsettings.json
│   ├── 🚀 Program.cs
│   ├── 🎮 Controllers/
│   ├── 🛡️ Middleware/
│   ├── 🔧 Services/
│   └── ⚙️ Configuration/
│
└── 🌐 frontend/                    # Interfaz React
    ├── 📚 README.md
    ├── 📦 package.json
    ├── 📋 tsconfig.json
    ├── 📂 public/
    └── 📂 src/
        ├── 🧩 components/          # Componentes React
        ├── 🔄 contexts/            # Context API
        ├── 🌐 services/            # Cliente HTTP
        └── 🎨 styles/              # CSS personalizado
```

## 🚀 Instalación y Configuración

### 🐳 Opción 1: Docker (Recomendado - Instalación Rápida)

La forma más sencilla de ejecutar todo el sistema con un solo comando.

#### Prerrequisitos
- **Docker Desktop** o **Docker Engine**
- **Docker Compose V2**

#### Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd hospitalSystem

# 2. Ejecutar todo el sistema
docker-compose up -d --build

# 3. Verificar que todo esté funcionando
docker-compose ps
```

#### 🌐 URLs Disponibles (Docker)

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **🌐 Frontend** | http://localhost:3001 | Interfaz principal del sistema |
| **⚕️ Admin API** | http://localhost:3000 | API de administración |
| **📋 Consultas API** | http://localhost:4000 | API de consultas médicas |
| **🔀 Gateway .NET** | http://localhost:5158 | Gateway unificado |
| **📚 Docs Admin API** | http://localhost:3000/docs | Documentación Swagger |
| **📚 Docs Consultas** | http://localhost:4000/docs | Documentación Swagger |

#### Comandos Docker Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reconstruir un servicio específico
docker-compose up --build admin-api

# Detener todos los servicios
docker-compose down

# Limpiar volúmenes (reset completo de DB)
docker-compose down -v
```

### 💻 Opción 2: Desarrollo Local

Para desarrollo activo con hot-reload y debugging completo.

#### Prerrequisitos
- **Node.js 18+**
- **npm**
- **MariaDB Server**
- **.NET 8 SDK** (opcional para Gateway)

#### Configuración de Base de Datos

```sql
-- Conectar a MariaDB como root
CREATE DATABASE admin_db;
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin123';
GRANT ALL PRIVILEGES ON admin_db.* TO 'admin'@'localhost';

CREATE DATABASE consultas_db;
CREATE USER 'consultas'@'localhost' IDENTIFIED BY 'consultas123';
GRANT ALL PRIVILEGES ON consultas_db.* TO 'consultas'@'localhost';

FLUSH PRIVILEGES;
```

#### Variables de Entorno

**admin-api/.env**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=admin_db
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-that-must-be-at-least-32-characters-long-for-security
```

**consultas-api/.env**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=consultas
DB_PASSWORD=consultas123
DB_NAME=consultas_db
PORT=4000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-that-must-be-at-least-32-characters-long-for-security
```

**frontend/.env** (opcional)
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_GATEWAY_URL=http://localhost:5158
REACT_APP_CONSULTAS_URL=http://localhost:4000
```

#### Ejecutar Servicios (4 terminales)

```bash
# Terminal 1 - Admin API
cd admin-api
npm install
npm run dev

# Terminal 2 - Consultas API  
cd consultas-api
npm install
npm run dev

# Terminal 3 - Frontend React
cd frontend
npm install
npm start

# Terminal 4 - Gateway .NET (opcional)
cd gateway-api
dotnet restore
dotnet run
```

### ⚡ Setup Inicial del Sistema

Una vez que los servicios estén ejecutándose:

1. **Abrir Frontend**: http://localhost:3001
2. **Crear Primer Admin**: Click en "¿Primera vez? Crear usuario administrador"
3. **Usar credenciales por defecto**:
   - Username: `admin`
   - Password: `admin123`
4. **Login**: Usar las credenciales creadas
5. **¡Sistema listo!** 🎉

## 🔐 Sistema de Autenticación y Autorización

### Roles de Usuario

| Rol | Permisos | Acceso |
|-----|----------|--------|
| **👑 Admin** | Gestión completa del sistema | Todos los módulos y datos |
| **👨‍⚕️ Médico** | Consultas de su centro | Solo datos de centro asignado |
| **👩‍💼 Empleado** | Acceso básico | Funcionalidades limitadas |

### Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant G as Gateway
    participant A as Admin API
    
    U->>F: Credenciales
    F->>G: POST /api/auth/login
    G->>A: POST /usuarios/validate
    A->>G: Usuario válido
    G->>F: JWT Token
    F->>U: Acceso concedido
```

### Middleware de Seguridad

- **🔒 JWT Tokens**: Autenticación stateless con expiración de 8 horas
- **🛡️ Role-based Access**: Control granular por rol de usuario
- **🏥 Centro Filtering**: Médicos solo ven datos de su centro
- **🔑 Password Hashing**: bcrypt con 10 rounds
- **🚫 CORS Protection**: Configurado para dominios permitidos

## 📊 Modelo de Datos

### Admin Database (admin_db)

```sql
-- Centros médicos
centros (id, nombre, direccion, ciudad, telefono, created_at)

-- Especialidades médicas  
especialidades (id, nombre, descripcion)

-- Personal del hospital
empleados (id, nombre, cedula, cargo, centro_id)

-- Médicos especializados
medicos (id, nombre, cedula, correo, telefono, especialidad_id, centro_id)

-- Usuarios del sistema
usuarios (id, username, password, role, centroId, created_at)
```

### Consultas Database (consultas_db)

```sql
-- Consultas médicas
consultas (id, paciente, doctorId, centroId, fecha, notas, estado, created_at)
```

## 🌐 API Endpoints con Ejemplos

### 🔐 Autenticación (Gateway .NET - Puerto 5158)

#### `POST /api/auth/login` - Iniciar Sesión
```bash
curl -X POST http://localhost:5158/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxIiwicm9sZSI6ImFkbWluIiwiY2VudHJvSWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsIm5iZiI6MTczMjY4ODEwMCwiZXhwIjoxNzMyNzE2OTAwLCJpYXQiOjE3MzI2ODgxMDAsImlzcyI6Ikhvc3BpdGFsR2F0ZXdheSIsImF1ZCI6Ikhvc3BpdGFsU3lzdGVtIn0.ABC123..."
}
```

#### `GET /api/auth/validate` - Validar Token JWT
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5158/api/auth/validate
```

**Respuesta:**
```json
{
  "id": "1",
  "username": "admin",
  "role": "admin",
  "centroId": 1,
  "valid": true
}
```

---

### ⚕️ Admin API (Puerto 3000)

#### Setup Inicial

##### `POST /setup/admin` - Crear Primer Administrador
```bash
curl -X POST http://localhost:3000/setup/admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "centroId": 1
  }'
```

**Respuesta:**
```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "centroId": 1,
  "created_at": "2025-09-27T15:30:00.000Z",
  "message": "Usuario administrador creado exitosamente"
}
```

#### Gestión de Centros

##### `GET /centros` - Listar Centros Médicos
```bash
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/centros
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Hospital General Quito",
    "direccion": "Av. República del Salvador N36-44",
    "ciudad": "Quito",
    "telefono": "02-2267-890",
    "created_at": "2025-09-27T10:00:00.000Z"
  },
  {
    "id": 2,
    "nombre": "Clínica San Francisco",
    "direccion": "Av. 6 de Diciembre N24-253",
    "ciudad": "Quito",
    "telefono": "02-2234-567",
    "created_at": "2025-09-27T11:15:00.000Z"
  }
]
```

##### `POST /centros` - Crear Nuevo Centro
```bash
curl -X POST http://localhost:3000/centros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "nombre": "Hospital Metropolitano",
    "direccion": "Av. Mariana de Jesús Oe7-36",
    "ciudad": "Quito",
    "telefono": "02-3998-000"
  }'
```

**Respuesta:**
```json
{
  "id": 3,
  "nombre": "Hospital Metropolitano",
  "direccion": "Av. Mariana de Jesús Oe7-36",
  "ciudad": "Quito",
  "telefono": "02-3998-000",
  "created_at": "2025-09-27T16:20:00.000Z"
}
```

##### `GET /centros/:id` - Obtener Centro Específico
```bash
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/centros/1
```

**Respuesta:**
```json
{
  "id": 1,
  "nombre": "Hospital General Quito",
  "direccion": "Av. República del Salvador N36-44",
  "ciudad": "Quito",
  "telefono": "02-2267-890",
  "created_at": "2025-09-27T10:00:00.000Z"
}
```

##### `PUT /centros/:id` - Actualizar Centro
```bash
curl -X PUT http://localhost:3000/centros/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "nombre": "Hospital General Quito - Actualizado",
    "telefono": "02-2267-999"
  }'
```

##### `DELETE /centros/:id` - Eliminar Centro
```bash
curl -X DELETE http://localhost:3000/centros/3 \
  -H "Authorization: Bearer <admin_token>"
```

**Respuesta:**
```json
{
  "message": "Centro eliminado"
}
```

#### Gestión de Especialidades

##### `GET /especialidades` - Listar Especialidades
```bash
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/especialidades
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Cardiología",
    "descripcion": "Especialidad médica que se ocupa del corazón y sistema cardiovascular"
  },
  {
    "id": 2,
    "nombre": "Medicina General",
    "descripcion": "Atención médica integral y de primer nivel"
  }
]
```

##### `POST /especialidades` - Crear Especialidad
```bash
curl -X POST http://localhost:3000/especialidades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "nombre": "Neurología",
    "descripcion": "Especialidad médica que trata trastornos del sistema nervioso"
  }'
```

**Respuesta:**
```json
{
  "id": 3,
  "nombre": "Neurología",
  "descripcion": "Especialidad médica que trata trastornos del sistema nervioso"
}
```

#### Gestión de Empleados

##### `GET /empleados` - Listar Empleados
```bash
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/empleados
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Juan Carlos Pérez",
    "cedula": "1712345678",
    "cargo": "Enfermero Jefe",
    "centro": {
      "id": 1,
      "nombre": "Hospital General Quito"
    }
  }
]
```

##### `POST /empleados` - Crear Empleado
```bash
curl -X POST http://localhost:3000/empleados \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "nombre": "María Elena García",
    "cedula": "1798765432",
    "cargo": "Auxiliar de Enfermería",
    "centro": {"id": 1}
  }'
```

#### Gestión de Médicos

##### `GET /medicos` - Listar Médicos
```bash
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/medicos
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Dr. Carlos Alberto Mendoza",
    "cedula": "1712345678",
    "correo": "carlos.mendoza@hospital.com",
    "telefono": "099-123-4567",
    "especialidad": {
      "id": 1,
      "nombre": "Cardiología"
    },
    "centro": {
      "id": 1,
      "nombre": "Hospital General Quito"
    }
  }
]
```

##### `POST /medicos` - Crear Médico
```bash
curl -X POST http://localhost:3000/medicos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "nombre": "Dra. Ana Patricia Rodríguez",
    "cedula": "1756789012",
    "correo": "ana.rodriguez@hospital.com",
    "telefono": "099-987-6543",
    "especialidad": {"id": 2},
    "centro": {"id": 1}
  }'
```

#### Gestión de Usuarios

##### `GET /usuarios` - Listar Usuarios del Sistema
```bash
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/usuarios
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "centroId": null,
    "created_at": "2025-09-27T10:00:00.000Z"
  },
  {
    "id": 2,
    "username": "dr_mendoza",
    "role": "medico",
    "centroId": 1,
    "created_at": "2025-09-27T11:30:00.000Z"
  }
]
```

##### `POST /usuarios` - Crear Nuevo Usuario
```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "username": "dra_rodriguez",
    "password": "password123",
    "role": "medico",
    "centroId": 1
  }'
```

**Respuesta:**
```json
{
  "id": 3,
  "username": "dra_rodriguez",
  "role": "medico",
  "centroId": 1,
  "created_at": "2025-09-27T16:45:00.000Z"
}
```

##### `POST /usuarios/validate` - Validar Credenciales
```bash
curl -X POST http://localhost:3000/usuarios/validate \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dr_mendoza",
    "password": "password123"
  }'
```

**Respuesta:**
```json
{
  "id": 2,
  "role": "medico",
  "centroId": 1,
  "username": "dr_mendoza"
}
```

---

### 📋 Consultas API (Puerto 4000)

#### Gestión de Consultas

##### `GET /consultas` - Listar Consultas
```bash
# Como administrador (ve todas las consultas)
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:4000/consultas

# Como médico (solo ve consultas de su centro)
curl -H "Authorization: Bearer <medico_token>" \
  http://localhost:4000/consultas
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "paciente": "Pedro González",
    "doctorId": 1,
    "centroId": 1,
    "fecha": "2025-09-28T09:30:00.000Z",
    "notas": "Consulta de control - Hipertensión arterial",
    "estado": "completada",
    "created_at": "2025-09-27T14:20:00.000Z"
  },
  {
    "id": 2,
    "paciente": "María Rodríguez",
    "doctorId": 1,
    "centroId": 1,
    "fecha": "2025-09-28T14:00:00.000Z",
    "notas": "Primera consulta - Dolor en el pecho",
    "estado": "programada",
    "created_at": "2025-09-27T15:10:00.000Z"
  }
]
```

##### `POST /consultas` - Crear Nueva Consulta
```bash
curl -X POST http://localhost:4000/consultas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <medico_token>" \
  -d '{
    "paciente": "Luis Fernando Morales",
    "doctorId": 1,
    "centroId": 1,
    "fecha": "2025-09-29T10:15:00Z",
    "notas": "Consulta de seguimiento post-cirugía",
    "estado": "programada"
  }'
```

**Respuesta:**
```json
{
  "id": 3,
  "paciente": "Luis Fernando Morales",
  "doctorId": 1,
  "centroId": 1,
  "fecha": "2025-09-29T10:15:00.000Z",
  "notas": "Consulta de seguimiento post-cirugía",
  "estado": "programada",
  "created_at": "2025-09-27T16:50:00.000Z"
}
```

##### `GET /consultas/:id` - Obtener Consulta Específica
```bash
curl -H "Authorization: Bearer <medico_token>" \
  http://localhost:4000/consultas/1
```

**Respuesta:**
```json
{
  "id": 1,
  "paciente": "Pedro González",
  "doctorId": 1,
  "centroId": 1,
  "fecha": "2025-09-28T09:30:00.000Z",
  "notas": "Consulta de control - Hipertensión arterial. Presión arterial estable. Continuar con medicación actual.",
  "estado": "completada",
  "created_at": "2025-09-27T14:20:00.000Z"
}
```

##### `PUT /consultas/:id` - Actualizar Consulta
```bash
curl -X PUT http://localhost:4000/consultas/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <medico_token>" \
  -d '{
    "notas": "Paciente presenta mejoría. Electrocardiograma normal. Se programa control en 3 meses.",
    "estado": "completada"
  }'
```

**Respuesta:**
```json
{
  "id": 2,
  "paciente": "María Rodríguez",
  "doctorId": 1,
  "centroId": 1,
  "fecha": "2025-09-28T14:00:00.000Z",
  "notas": "Paciente presenta mejoría. Electrocardiograma normal. Se programa control en 3 meses.",
  "estado": "completada",
  "created_at": "2025-09-27T15:10:00.000Z"
}
```

##### `DELETE /consultas/:id` - Eliminar Consulta
```bash
curl -X DELETE http://localhost:4000/consultas/3 \
  -H "Authorization: Bearer <medico_token>"
```

**Respuesta:**
```json
{
  "message": "Consulta eliminada"
}
```

#### Reportes Médicos

##### `GET /reportes/doctor/:id` - Reporte de Consultas por Médico
```bash
# Reporte completo
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:4000/reportes/doctor/1

# Reporte con filtro de fechas
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:4000/reportes/doctor/1?from=2025-09-01&to=2025-09-30"
```

**Respuesta:**
```json
{
  "doctorId": 1,
  "total": 2,
  "consultas": [
    {
      "id": 1,
      "paciente": "Pedro González",
      "centroId": 1,
      "fecha": "2025-09-28T09:30:00.000Z",
      "estado": "completada",
      "notas": "Consulta de control - Hipertensión arterial"
    },
    {
      "id": 2,
      "paciente": "María Rodríguez",
      "centroId": 1,
      "fecha": "2025-09-28T14:00:00.000Z",
      "estado": "completada",
      "notas": "Primera consulta - Dolor en el pecho"
    }
  ]
}
```

---

### 🌐 Frontend (Puerto 3001)

#### Páginas Principales

##### Login Page (`/login`)
- **URL**: http://localhost:3001/login
- **Funcionalidad**: Autenticación de usuarios
- **Credenciales por defecto**: 
  - Username: `admin`
  - Password: `admin123`

##### Dashboard (`/dashboard`)
- **URL**: http://localhost:3001/dashboard
- **Funcionalidad**: Panel principal con navegación por roles
- **Secciones disponibles**:
  - **Inicio**: Overview del sistema
  - **Centros**: Gestión de centros médicos (solo admin)
  - **Usuarios**: Gestión de usuarios (solo admin)
  - **Consultas**: Gestión de consultas médicas

#### Ejemplos de Interacción

##### Crear Centro desde Frontend
1. Login como administrador
2. Ir a pestaña "Centros"
3. Llenar formulario:
   ```
   Nombre: Hospital del Niño
   Dirección: Av. Eloy Alfaro N39-142
   Ciudad: Quito
   Teléfono: 02-2567-890
   ```
4. Click "Crear Centro"

##### Crear Consulta desde Frontend
1. Login como médico o administrador
2. Ir a pestaña "Consultas"
3. Llenar formulario:
   ```
   Paciente: Carlos Ramírez
   Doctor ID: 1
   Centro ID: 1 (automático para médicos)
   Fecha: 2025-09-29 15:30
   Notas: Consulta de rutina
   Estado: programada
   ```
4. Click "Crear Consulta"

---

### 🔗 Gateway como Punto de Entrada Unificado (.NET)

El Gateway .NET funciona como el punto de entrada principal del sistema, proporcionando autenticación centralizada y proxy a todas las APIs. **Es la forma recomendada de interactuar con el sistema.**

#### 🚀 Flujo Completo con Gateway

##### 1. Autenticación a través del Gateway
```bash
# Login inicial - Punto de entrada del sistema
curl -X POST http://localhost:5158/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxIiwicm9sZSI6ImFkbWluIiwiY2VudHJvSWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsIm5iZiI6MTczMjY4ODEwMCwiZXhwIjoxNzMyNzE2OTAwLCJpYXQiOjE3MzI2ODgxMDAsImlzcyI6Ikhvc3BpdGFsR2F0ZXdheSIsImF1ZCI6Ikhvc3BpdGFsU3lzdGVtIn0.ABC123..."
}
```

##### 2. Usar el Token para Acceder a Admin API
```bash
# Obtener centros médicos
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5158/admin/centros

# Crear nuevo centro
curl -X POST http://localhost:5158/admin/centros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "nombre": "Hospital del Valle",
    "direccion": "Av. Los Shyris N38-102",
    "ciudad": "Quito",
    "telefono": "02-3456-789"
  }'

# Gestionar usuarios
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5158/admin/usuarios

# Gestionar médicos
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5158/admin/medicos
```

##### 3. Usar el Token para Acceder a Consultas API
```bash
# Obtener consultas médicas
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5158/consultas/consultas

# Crear nueva consulta
curl -X POST http://localhost:5158/consultas/consultas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "paciente": "Carlos Mendoza",
    "doctorId": 1,
    "centroId": 1,
    "fecha": "2025-09-30T10:00:00Z",
    "notas": "Consulta de seguimiento",
    "estado": "programada"
  }'

# Obtener reportes médicos
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5158/consultas/reportes/doctor/1
```

#### 🎯 Mapeo de Rutas del Gateway

| Gateway URL | API Destino | Descripción |
|-------------|-------------|-------------|
| `POST /api/auth/login` | Admin API | Autenticación centralizada |
| `GET /api/auth/validate` | Admin API | Validación de token |
| `GET /admin/*` | Admin API (puerto 3000) | Proxy a todas las rutas de administración |
| `GET /consultas/*` | Consultas API (puerto 4000) | Proxy a todas las rutas de consultas |

#### 📋 Ejemplos Completos de Admin API via Gateway

```bash
# 1. Login y obtener token
TOKEN=$(curl -s -X POST http://localhost:5158/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | \
  jq -r '.token')

# 2. Usar token para operaciones CRUD

# Centros médicos
curl -H "Authorization: Bearer $TOKEN" http://localhost:5158/admin/centros
curl -X POST http://localhost:5158/admin/centros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nombre": "Clínica Nueva", "direccion": "Av. Principal 123", "ciudad": "Quito", "telefono": "02-1234567"}'

# Especialidades
curl -H "Authorization: Bearer $TOKEN" http://localhost:5158/admin/especialidades
curl -X POST http://localhost:5158/admin/especialidades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nombre": "Pediatría", "descripcion": "Medicina infantil"}'

# Médicos
curl -H "Authorization: Bearer $TOKEN" http://localhost:5158/admin/medicos
curl -X POST http://localhost:5158/admin/medicos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nombre": "Dr. Roberto Silva",
    "cedula": "1789012345",
    "correo": "roberto.silva@hospital.com",
    "telefono": "099-555-0123",
    "especialidad": {"id": 1},
    "centro": {"id": 1}
  }'

# Usuarios del sistema
curl -H "Authorization: Bearer $TOKEN" http://localhost:5158/admin/usuarios
curl -X POST http://localhost:5158/admin/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "dr_silva",
    "password": "hospital123",
    "role": "medico",
    "centroId": 1
  }'
```

#### 📋 Ejemplos Completos de Consultas API via Gateway

```bash
# Usando el mismo token de arriba para consultas médicas

# Listar consultas (filtrado automático por rol)
curl -H "Authorization: Bearer $TOKEN" http://localhost:5158/consultas/consultas

# Crear consulta médica
curl -X POST http://localhost:5158/consultas/consultas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paciente": "Ana García Ruiz",
    "doctorId": 1,
    "centroId": 1,
    "fecha": "2025-09-30T14:30:00Z",
    "notas": "Consulta de control mensual - Diabetes tipo 2",
    "estado": "programada"
  }'

# Actualizar consulta
curl -X PUT http://localhost:5158/consultas/consultas/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "notas": "Paciente muestra mejora significativa. Glucosa en rangos normales. Continuar tratamiento.",
    "estado": "completada"
  }'

# Obtener reporte de médico
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5158/consultas/reportes/doctor/1?from=2025-09-01&to=2025-09-30"
```

#### 🔄 Workflow Típico con Gateway

```bash
#!/bin/bash
# Script de ejemplo para workflow completo

# 1. Login y obtener token
echo "🔐 Autenticando usuario..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5158/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "✅ Token obtenido: ${TOKEN:0:20}..."

# 2. Validar token
echo "🔍 Validando token..."
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:5158/api/auth/validate | jq '.'

# 3. Crear centro médico
echo "🏥 Creando centro médico..."
CENTRO_RESPONSE=$(curl -s -X POST http://localhost:5158/admin/centros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nombre": "Hospital San Carlos",
    "direccion": "Av. Amazonas N24-155",
    "ciudad": "Quito",
    "telefono": "02-2555-123"
  }')

CENTRO_ID=$(echo $CENTRO_RESPONSE | jq -r '.id')
echo "✅ Centro creado con ID: $CENTRO_ID"

# 4. Crear especialidad
echo "⚕️ Creando especialidad..."
ESPECIALIDAD_RESPONSE=$(curl -s -X POST http://localhost:5158/admin/especialidades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nombre": "Medicina Interna",
    "descripcion": "Diagnóstico y tratamiento de enfermedades internas"
  }')

ESPECIALIDAD_ID=$(echo $ESPECIALIDAD_RESPONSE | jq -r '.id')
echo "✅ Especialidad creada con ID: $ESPECIALIDAD_ID"

# 5. Crear médico
echo "👨‍⚕️ Creando médico..."
MEDICO_RESPONSE=$(curl -s -X POST http://localhost:5158/admin/medicos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"nombre\": \"Dr. Fernando López\",
    \"cedula\": \"1723456789\",
    \"correo\": \"fernando.lopez@hospital.com\",
    \"telefono\": \"099-876-5432\",
    \"especialidad\": {\"id\": $ESPECIALIDAD_ID},
    \"centro\": {\"id\": $CENTRO_ID}
  }")

MEDICO_ID=$(echo $MEDICO_RESPONSE | jq -r '.id')
echo "✅ Médico creado con ID: $MEDICO_ID"

# 6. Crear usuario para el médico
echo "👤 Creando usuario para médico..."
curl -s -X POST http://localhost:5158/admin/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"username\": \"dr_lopez\",
    \"password\": \"medicina123\",
    \"role\": \"medico\",
    \"centroId\": $CENTRO_ID
  }" | jq '.'

# 7. Crear consulta médica
echo "📋 Creando consulta médica..."
curl -s -X POST http://localhost:5158/consultas/consultas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"paciente\": \"Roberto Martínez\",
    \"doctorId\": $MEDICO_ID,
    \"centroId\": $CENTRO_ID,
    \"fecha\": \"2025-09-30T16:00:00Z\",
    \"notas\": \"Primera consulta - Dolor abdominal crónico\",
    \"estado\": \"programada\"
  }" | jq '.'

echo "🎉 ¡Setup completo del hospital a través del Gateway!"
```

#### 🌐 Ventajas del Gateway

✅ **Punto de entrada único**: Una sola URL para todo el sistema
✅ **Autenticación centralizada**: Login único para todas las APIs
✅ **Gestión de tokens**: Validación automática de JWT
✅ **Proxy inteligente**: Enrutamiento automático a APIs correctas
✅ **Seguridad mejorada**: Capa adicional de protección
✅ **Monitoreo centralizado**: Logs y métricas unificadas

## 🧪 Ejemplos de Uso

### 1. Autenticación via Gateway

```bash
# Login de usuario
curl -X POST http://localhost:5158/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Respuesta
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Validar token
curl -H "Authorization: Bearer <token>" \
  http://localhost:5158/api/auth/validate
```

### 2. Gestión de Centros Médicos

```bash
# Crear centro médico
curl -X POST http://localhost:3000/centros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "nombre": "Hospital General Quito",
    "direccion": "Av. República del Salvador N36-44",
    "ciudad": "Quito",
    "telefono": "02-2267-890"
  }'

# Listar centros
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/centros
```

### 3. Crear Usuario Médico

```bash
# Crear especialidad primero
curl -X POST http://localhost:3000/especialidades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "nombre": "Cardiología",
    "descripcion": "Especialidad en enfermedades del corazón"
  }'

# Crear médico
curl -X POST http://localhost:3000/medicos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "nombre": "Dr. Carlos Mendoza",
    "cedula": "1712345678",
    "correo": "carlos.mendoza@hospital.com",
    "telefono": "099-123-4567",
    "especialidad": {"id": 1},
    "centro": {"id": 1}
  }'

# Crear usuario para el médico
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "username": "dr_mendoza",
    "password": "password123",
    "role": "medico",
    "centroId": 1
  }'
```

### 4. Gestión de Consultas

```bash
# Crear consulta médica
curl -X POST http://localhost:4000/consultas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <medico_token>" \
  -d '{
    "paciente": "María Rodríguez",
    "doctorId": 1,
    "centroId": 1,
    "fecha": "2025-09-28T09:30:00Z",
    "notas": "Control de rutina - Hipertensión",
    "estado": "programada"
  }'

# Ver consultas (filtrado automático por centro para médicos)
curl -H "Authorization: Bearer <medico_token>" \
  http://localhost:4000/consultas

# Reporte por médico
curl -H "Authorization: Bearer <token>" \
  "http://localhost:4000/reportes/doctor/1?from=2025-09-01&to=2025-09-30"
```

### 5. Usando el Frontend

1. **Abrir**: http://localhost:3001
2. **Login**: admin / admin123
3. **Crear Centro**: Navegación → Centros → Llenar formulario
4. **Crear Usuario**: Navegación → Usuarios → Seleccionar rol
5. **Ver Consultas**: Navegación → Consultas

## 🎯 Casos de Uso Completos

### Caso 1: Setup de Hospital Nuevo

```bash
# 1. Crear centro médico
curl -X POST http://localhost:3000/centros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "nombre": "Clínica San Francisco",
    "direccion": "Av. 6 de Diciembre N24-253",
    "ciudad": "Quito", 
    "telefono": "02-2234-567"
  }'

# 2. Crear especialidades
curl -X POST http://localhost:3000/especialidades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"nombre": "Medicina General", "descripcion": "Atención médica general"}'

# 3. Crear médico
curl -X POST http://localhost:3000/medicos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "nombre": "Dra. Ana Pérez",
    "cedula": "1723456789",
    "correo": "ana.perez@clinica.com",
    "telefono": "099-876-5432",
    "especialidad": {"id": 1},
    "centro": {"id": 1}
  }'

# 4. Crear usuario para médico
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "username": "dra_perez",
    "password": "clinica123",
    "role": "medico",
    "centroId": 1
  }'
```

### Caso 2: Flujo de Consulta Médica

```bash
# 1. Login como médico
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5158/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "dra_perez", "password": "clinica123"}')

MEDICO_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

# 2. Crear consulta
curl -X POST http://localhost:4000/consultas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MEDICO_TOKEN" \
  -d '{
    "paciente": "Pedro González",
    "doctorId": 1,
    "centroId": 1,
    "fecha": "2025-09-28T14:30:00Z",
    "notas": "Paciente presenta síntomas de gripe",
    "estado": "programada"
  }'

# 3. Actualizar consulta a completada
curl -X PUT http://localhost:4000/consultas/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MEDICO_TOKEN" \
  -d '{
    "notas": "Diagnóstico: Rinofaringitis. Prescripción: Paracetamol 500mg cada 8h",
    "estado": "completada"
  }'

# 4. Ver reporte de consultas
curl -H "Authorization: Bearer $MEDICO_TOKEN" \
  "http://localhost:4000/reportes/doctor/1?from=2025-09-01"
```

## 🛠️ Comandos Útiles

### Docker Operations
```bash
# 🚀 Iniciar todo el sistema
docker-compose up -d --build

# 📋 Ver estado de contenedores
docker-compose ps

# 📊 Ver logs en tiempo real
docker-compose logs -f

# 📊 Ver logs de un servicio específico
docker-compose logs -f admin-api

# 🔄 Reconstruir un servicio
docker-compose up --build admin-api

# ⏹️ Detener todos los servicios
docker-compose down

# 🗑️ Limpiar todo (incluye volúmenes de BD)
docker-compose down -v

# 🔍 Ejecutar comando en contenedor
docker exec -it admin-api bash
```

### Desarrollo Local
```bash
# 📦 Instalar dependencias en todos los servicios
for dir in admin-api consultas-api frontend; do
  (cd $dir && npm install)
done

# 🚀 Iniciar servicio en desarrollo
npm run dev                   # En cada directorio de API
npm start                     # En frontend

# 🏗️ Construir para producción
npm run build

# 🧪 Ejecutar tests (cuando estén disponibles)
npm test
```

### Base de Datos
```bash
# 📊 Backup de base de datos Admin
docker exec admin-db mysqldump -u admin -padmin123 admin_db > backup_admin.sql

# 📊 Backup de base de datos Consultas  
docker exec consultas-db mysqldump -u consultas -pconsultas123 consultas_db > backup_consultas.sql

# 📥 Restaurar backup
docker exec -i admin-db mysql -u admin -padmin123 admin_db < backup_admin.sql

# 🔍 Acceder a MariaDB
docker exec -it admin-db mysql -u admin -padmin123 admin_db
```

## 🗄️ Estructura de Base de Datos

### 🏥 Admin Database (admin_db)

```sql
-- Centros médicos
CREATE TABLE centros (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(250),
    ciudad VARCHAR(100),
    telefono VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Especialidades médicas
CREATE TABLE especialidades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT
);

-- Personal del hospital
CREATE TABLE empleados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    centro_id INT,
    FOREIGN KEY (centro_id) REFERENCES centros(id)
);

-- Médicos especializados
CREATE TABLE medicos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    correo VARCHAR(150) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    especialidad_id INT,
    centro_id INT,
    FOREIGN KEY (especialidad_id) REFERENCES especialidades(id),
    FOREIGN KEY (centro_id) REFERENCES centros(id)
);

-- Usuarios del sistema
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'medico', 'empleado') DEFAULT 'empleado',
    centroId INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (centroId) REFERENCES centros(id)
);
```

### 📋 Consultas Database (consultas_db)

```sql
-- Consultas médicas
CREATE TABLE consultas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente VARCHAR(255) NOT NULL,
    doctorId INT NOT NULL,           -- Referencia a medicos.id en admin_db
    centroId INT NOT NULL,           -- Referencia a centros.id en admin_db  
    fecha TIMESTAMP NOT NULL,
    notas TEXT,
    estado VARCHAR(50) DEFAULT 'programada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_consultas_doctor ON consultas(doctorId);
CREATE INDEX idx_consultas_centro ON consultas(centroId);
CREATE INDEX idx_consultas_fecha ON consultas(fecha);
CREATE INDEX idx_consultas_estado ON consultas(estado);
```

### 🔗 Relaciones entre Microservicios

```mermaid
erDiagram
    CENTROS ||--o{ MEDICOS : "pertenece_a"
    CENTROS ||--o{ EMPLEADOS : "trabaja_en"
    CENTROS ||--o{ USUARIOS : "asignado_a"
    ESPECIALIDADES ||--o{ MEDICOS : "tiene"
    MEDICOS ||--o{ CONSULTAS : "atiende"
    CENTROS ||--o{ CONSULTAS : "se_realiza_en"
```

## 🔧 Configuración Avanzada

### Variables de Entorno por Servicio

#### Admin API
```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=admin_db

# Servidor
PORT=3000
NODE_ENV=development

# Seguridad
JWT_SECRET=your-super-secret-key-that-must-be-at-least-32-characters-long-for-security
```

#### Consultas API
```env
# Base de datos (puerto diferente)
DB_HOST=localhost
DB_PORT=3308
DB_USER=consultas
DB_PASSWORD=consultas123
DB_NAME=consultas_db

# Servidor
PORT=4000
NODE_ENV=development

# Seguridad (debe coincidir con Admin API)
JWT_SECRET=your-super-secret-key-that-must-be-at-least-32-characters-long-for-security
```

#### Gateway .NET
```json
{
  "Gateway": {
    "AdminApiUrl": "http://localhost:3000",
    "ConsultasApiUrl": "http://localhost:4000",
    "TimeoutSeconds": 60
  },
  "Jwt": {
    "SecretKey": "your-super-secret-key-that-must-be-at-least-32-characters-long-for-security",
    "Issuer": "HospitalGateway",
    "Audience": "HospitalSystem"
  }
}
```

#### Frontend React
```env
# APIs (opcionales, hay defaults)
REACT_APP_API_URL=http://localhost:3000
REACT_APP_GATEWAY_URL=http://localhost:5158
REACT_APP_CONSULTAS_URL=http://localhost:4000

# Build optimizations
GENERATE_SOURCEMAP=false
REACT_APP_VERSION=$npm_package_version
```

## 🐛 Troubleshooting

### Problemas Comunes con Docker

#### 🔴 Error de conexión a base de datos
```bash
# Verificar que las bases de datos estén ejecutándose
docker-compose ps

# Si no están corriendo:
docker-compose up -d admin-db consultas-db

# Ver logs de la base de datos
docker-compose logs admin-db
```

#### 🔴 Puerto ya en uso
```bash
# Encontrar qué proceso usa el puerto
netstat -tulpn | grep :3000

# Cambiar puerto en docker-compose.yml o .env
# O detener el proceso conflictivo
```

#### 🔴 Problemas de construcción de imágenes
```bash
# Limpiar imágenes y reconstruir
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

#### 🔴 Gateway .NET no conecta con APIs
```bash
# Verificar que las APIs estén respondiendo
curl http://localhost:3000/centros
curl http://localhost:4000/consultas

# Revisar configuración del Gateway
docker-compose logs gateway-api
```

### Problemas Comunes en Desarrollo Local

#### 🔴 MariaDB no conecta
```bash
# Verificar que MariaDB esté ejecutándose
sudo systemctl status mariadb  # Linux
brew services list | grep mariadb  # macOS

# Iniciar MariaDB si está detenido
sudo systemctl start mariadb  # Linux
brew services start mariadb  # macOS

# Verificar credenciales
mysql -u admin -padmin123 admin_db
```

#### 🔴 Error "Cannot find module"
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# O usar npm ci para instalación limpia
npm ci
```

#### 🔴 Frontend no carga datos
```bash
# Verificar que las APIs estén corriendo
curl http://localhost:3000/health
curl http://localhost:4000/health

# Revisar consola del navegador para errores de CORS
# Verificar que el token sea válido en localStorage
```

#### 🔴 JWT Token inválido
```bash
# Verificar que JWT_SECRET sea igual en todas las APIs
grep JWT_SECRET admin-api/.env
grep JWT_SECRET consultas-api/.env

# Limpiar localStorage del navegador
localStorage.clear()
```

### Diagnóstico Rápido

#### 🔍 Health Check del Sistema
```bash
#!/bin/bash
echo "🏥 Hospital System Health Check"
echo "================================"

# Frontend
echo -n "🌐 Frontend (3001): "
curl -s http://localhost:3001 > /dev/null && echo "✅ OK" || echo "❌ FAIL"

# Admin API
echo -n "⚕️ Admin API (3000): "
curl -s http://localhost:3000/centros > /dev/null && echo "✅ OK" || echo "❌ FAIL"

# Consultas API  
echo -n "📋 Consultas API (4000): "
curl -s http://localhost:4000/consultas > /dev/null && echo "✅ OK" || echo "❌ FAIL"

# Gateway
echo -n "🔀 Gateway (5158): "
curl -s http://localhost:5158/health > /dev/null && echo "✅ OK" || echo "❌ FAIL"

echo "================================"
```

#### 🔍 Docker Status Check
```bash
# Verificar estado de todos los contenedores
docker-compose ps

# Ver uso de recursos
docker stats

# Verificar logs de errores
docker-compose logs --tail=50 | grep -i error
```

### Resetear Sistema Completo

#### 🔄 Reset Docker
```bash
# Detener todo y limpiar volúmenes
docker-compose down -v

# Limpiar imágenes (opcional)
docker system prune -a

# Reconstruir todo
docker-compose up -d --build
```

#### 🔄 Reset Desarrollo Local
```bash
# Limpiar dependencias
for dir in admin-api consultas-api frontend; do
  (cd $dir && rm -rf node_modules package-lock.json)
done

# Reinstalar
for dir in admin-api consultas-api frontend; do
  (cd $dir && npm install)
done

# Reset base de datos
mysql -u root -p -e "DROP DATABASE admin_db; CREATE DATABASE admin_db;"
mysql -u root -p -e "DROP DATABASE consultas_db; CREATE DATABASE consultas_db;"
```

## 🚀 Deployment en Producción

### Consideraciones de Seguridad
- [ ] Cambiar JWT_SECRET por valores únicos y seguros
- [ ] Usar HTTPS en todas las comunicaciones
- [ ] Configurar CORS para dominios específicos
- [ ] Implementar rate limiting
- [ ] Usar variables de entorno para credenciales
- [ ] Configurar SSL para bases de datos

### Docker Production
```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  admin-api:
    build: ./admin-api
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
```

## 🤝 Contribución

### Desarrollo Colaborativo
1. **Fork** del repositorio
2. **Crear rama feature**: `git checkout -b feature/nueva-funcionalidad`
3. **Commit cambios**: `git commit -am 'feat: agregar nueva funcionalidad'`
4. **Push**: `git push origin feature/nueva-funcionalidad`
5. **Pull Request** con descripción detallada

### Convenciones de Código
- **TypeScript**: Strict mode habilitado
- **ESLint**: Configuración estándar
- **Commits**: Conventional Commits
- **Tests**: Jest + Testing Library (cuando se implementen)

### Reportar Issues
Incluir información completa:
- Sistema operativo
- Versión de Node.js/Docker
- Pasos para reproducir
- Logs de error completos
- Screenshots si aplica

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2025 Hospital Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 📞 Soporte

### 🏥 Documentación Específica
- [📚 Admin API Documentation](./admin-api/README.md)
- [📚 Consultas API Documentation](./consultas-api/README.md)
- [📚 Gateway .NET Documentation](./gateway-api/README.md)
- [📚 Frontend Documentation](./frontend/README.md)

### 🛠️ Stack Técnico
- **Backend**: Node.js 20, TypeScript, Express.js, TypeORM
- **Frontend**: React 19, TypeScript, Axios, React Router DOM
- **Database**: MariaDB 10.11
- **Gateway**: .NET 8, ASP.NET Core
- **DevOps**: Docker, Docker Compose

### 📊 Métricas del Proyecto
- **Microservicios**: 4 (Frontend, Admin API, Consultas API, Gateway)
- **Entidades principales**: 6 (Centro, Usuario, Empleado, Médico, Especialidad, Consulta)
- **Endpoints**: 25+ APIs RESTful
- **Roles de usuario**: 3 (Admin, Médico, Empleado)
- **Bases de datos**: 2 (admin_db, consultas_db)

---

**🎉 ¡Sistema listo para usar! Desarrollado con ❤️ para la gestión hospitalaria moderna.**