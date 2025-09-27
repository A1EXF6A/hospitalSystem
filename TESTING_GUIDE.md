# 🔐 Guía de Pruebas de Autenticación - Hospital System

## 📋 Requisitos Previos

1. **Servicios en ejecución:**
   ```bash
   # Iniciar bases de datos y APIs
   docker-compose up -d
   
   # Iniciar Gateway API (.NET)
   cd gateway-api
   dotnet run
   ```

2. **Puertos utilizados:**
   - Admin API: `http://localhost:3000`
   - Consultas API: `http://localhost:4000`
   - Gateway API: `http://localhost:5158`

## 🧪 Secuencia de Pruebas en Postman

### 1️⃣ Crear Usuario Administrador Inicial

**Endpoint:** `POST http://localhost:3000/setup/admin`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123",
  "centroId": 1
}
```

**Respuesta Esperada:**
```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "centroId": 1,
  "created_at": "2025-09-27T06:15:30.000Z",
  "message": "Usuario administrador creado exitosamente"
}
```

---

### 2️⃣ Login a través del Gateway

**Endpoint:** `POST http://localhost:5158/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta Esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**📝 Importante:** Copia el token de la respuesta, lo necesitarás para las siguientes pruebas.

---

### 3️⃣ Validar Token

**Endpoint:** `GET http://localhost:5158/api/auth/validate`

**Headers:**
```
Authorization: Bearer <tu-token-aquí>
```

**Respuesta Esperada:**
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

### 4️⃣ Acceder a Admin API (Protegida)

**Endpoint:** `GET http://localhost:3000/centros`

**Headers:**
```
Authorization: Bearer <tu-token-aquí>
```

**Respuesta Esperada:**
```json
[]
```
*O lista de centros si existen*

---

### 5️⃣ Crear Centro Médico

**Endpoint:** `POST http://localhost:3000/centros`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <tu-token-aquí>
```

**Body (JSON):**
```json
{
  "nombre": "Hospital Central",
  "direccion": "Av. Principal 123",
  "ciudad": "Quito",
  "telefono": "0999999999"
}
```

**Respuesta Esperada:**
```json
{
  "id": 1,
  "nombre": "Hospital Central",
  "direccion": "Av. Principal 123",
  "ciudad": "Quito",
  "telefono": "0999999999",
  "created_at": "2025-09-27T06:20:30.000Z"
}
```

---

### 6️⃣ Crear Usuario Médico

**Endpoint:** `POST http://localhost:3000/usuarios`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <tu-token-aquí>
```

**Body (JSON):**
```json
{
  "username": "medico1",
  "password": "medico123",
  "role": "medico",
  "centroId": 1
}
```

**Respuesta Esperada:**
```json
{
  "id": 2,
  "username": "medico1",
  "role": "medico",
  "centroId": 1,
  "created_at": "2025-09-27T06:25:30.000Z"
}
```

---

### 7️⃣ Login como Médico

**Endpoint:** `POST http://localhost:5158/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "medico1",
  "password": "medico123"
}
```

**Respuesta Esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**📝 Importante:** Este será un token diferente con rol de médico.

---

### 8️⃣ Intentar Acceder a Admin API como Médico (Debe Fallar)

**Endpoint:** `GET http://localhost:3000/centros`

**Headers:**
```
Authorization: Bearer <token-de-medico>
```

**Respuesta Esperada (Error 403):**
```json
{
  "message": "Acceso denegado. Solo administradores pueden acceder a este recurso"
}
```

---

### 9️⃣ Acceder a Consultas API como Médico (Debe Funcionar)

**Endpoint:** `GET http://localhost:4000/consultas`

**Headers:**
```
Authorization: Bearer <token-de-medico>
```

**Respuesta Esperada:**
```json
[]
```
*Solo consultas del centro del médico*

---

### 🔟 Crear Consulta como Médico

**Endpoint:** `POST http://localhost:4000/consultas`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token-de-medico>
```

**Body (JSON):**
```json
{
  "paciente": "Juan Pérez",
  "doctorId": 1,
  "centroId": 1,
  "fecha": "2025-09-28T10:00:00",
  "notas": "Consulta de rutina",
  "estado": "programada"
}
```

**Respuesta Esperada:**
```json
{
  "id": 1,
  "paciente": "Juan Pérez",
  "doctorId": 1,
  "centroId": 1,
  "fecha": "2025-09-28T10:00:00.000Z",
  "notas": "Consulta de rutina",
  "estado": "programada",
  "created_at": "2025-09-27T06:30:30.000Z"
}
```

---

## 🔍 Pruebas de Autorización

### ✅ Casos que DEBEN Funcionar:

1. **Admin puede:**
   - Acceder a todas las rutas de Admin API
   - Acceder a todas las rutas de Consultas API
   - Ver todas las consultas sin filtros

2. **Médico puede:**
   - Acceder a Consultas API
   - Ver solo consultas de su centro
   - Crear consultas para su centro

### ❌ Casos que DEBEN Fallar:

1. **Sin token:**
   - Cualquier ruta protegida debe devolver 401

2. **Token inválido:**
   - Cualquier ruta protegida debe devolver 403

3. **Médico NO puede:**
   - Acceder a Admin API (debe devolver 403)
   - Ver consultas de otros centros

---

## 🚨 Solución de Problemas

### Si el Gateway API se cierra:
```bash
# Revisar logs para errores específicos
cd gateway-api
dotnet run

# O usar directamente las APIs:
# Admin API: http://localhost:3000
# Consultas API: http://localhost:4000
```

### Si hay errores de base de datos:
```bash
# Reiniciar contenedores
docker-compose restart
```

### Si el token expira:
- Los tokens tienen una duración de 8 horas
- Realiza un nuevo login para obtener un token fresco

---

## 📊 Colección de Postman

Puedes importar esta colección JSON en Postman:

```json
{
  "info": {
    "name": "Hospital System Auth Tests",
    "description": "Pruebas de autenticación y autorización"
  },
  "variable": [
    {
      "key": "admin_token",
      "value": ""
    },
    {
      "key": "medico_token", 
      "value": ""
    }
  ],
  "item": [
    {
      "name": "1. Setup Admin",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/setup/admin",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"admin123\",\n  \"centroId\": 1\n}"
        }
      }
    },
    {
      "name": "2. Login Admin",
      "request": {
        "method": "POST",
        "url": "http://localhost:5158/api/auth/login",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"admin123\"\n}"
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.collectionVariables.set('admin_token', pm.response.json().token);"
            ]
          }
        }
      ]
    }
  ]
}
```

---

## 🎯 Resultados Esperados

Al completar todas las pruebas, habrás verificado:

- ✅ Creación de usuarios
- ✅ Autenticación JWT
- ✅ Autorización por roles
- ✅ Filtrado por centro para médicos
- ✅ Protección de endpoints
- ✅ Manejo de errores de autorización

¡El sistema de autenticación y autorización está funcionando correctamente!