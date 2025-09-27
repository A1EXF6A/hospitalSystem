# Frontend - Sistema Hospitalario

Interfaz web desarrollada en React con TypeScript para la gestión del sistema hospitalario. Proporciona una interfaz moderna y responsiva para interactuar con las APIs del sistema.

## 🏗️ Arquitectura

```
frontend/
├── public/                    # Archivos estáticos
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/           # Componentes React
│   │   ├── Login.tsx        # Página de login
│   │   ├── Login.css
│   │   ├── Dashboard.tsx    # Panel principal
│   │   └── Dashboard.css
│   ├── contexts/            # Context API
│   │   └── AuthContext.tsx  # Manejo de autenticación
│   ├── services/            # Servicios de API
│   │   └── api.ts          # Cliente HTTP con axios
│   ├── App.tsx             # Componente principal
│   ├── App.css
│   ├── index.tsx           # Punto de entrada
│   └── index.css
├── package.json
├── tsconfig.json
└── .env                    # Variables de entorno
```

## 🚀 Tecnologías

- **React 19** + **TypeScript**
- **React Router DOM** - Navegación SPA
- **Axios** - Cliente HTTP para APIs
- **CSS3** - Estilos personalizados con gradientes
- **Context API** - Manejo de estado global
- **Local Storage** - Persistencia de tokens

## 📦 Instalación y Configuración

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
cp .env.example .env

# Iniciar servidor de desarrollo
npm start

# La aplicación se abre en http://localhost:3001
```

### Construcción para Producción

```bash
# Construir aplicación optimizada
npm run build

# Los archivos se generan en /build

# Servir aplicación estática
npm install -g serve
serve -s build
```

## 🔧 Configuración

### Variables de Entorno

```env
# .env (opcional)
REACT_APP_API_URL=http://localhost:3000          # Admin API
REACT_APP_GATEWAY_URL=http://localhost:5158      # Gateway .NET
REACT_APP_CONSULTAS_URL=http://localhost:4000    # Consultas API
```

### URLs por Defecto
Si no se configuran variables de entorno, se usan:
- **Admin API**: `http://localhost:3000`
- **Gateway API**: `http://localhost:5158`
- **Consultas API**: `http://localhost:4000`

## 🔐 Sistema de Autenticación

### AuthContext
Manejo centralizado de autenticación con Context API:

```typescript
interface AuthContextType {
  user: User | null;           // Datos del usuario autenticado
  token: string | null;        // Token JWT
  login: (username, password) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;    // Estado de autenticación
  isAdmin: boolean;           // True si es administrador
  isMedico: boolean;          // True si es médico
}
```

### Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales
2. **Validación**: Se intenta con Gateway API, fallback a Admin API directa
3. **Token**: Se almacena JWT en localStorage
4. **Navegación**: Redirección automática a Dashboard
5. **Persistencia**: Token se valida al recargar página

### Rutas Protegidas

```typescript
// Solo usuarios autenticados
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Solo usuarios no autenticados
<PublicRoute>
  <Login />
</PublicRoute>
```

## 🎨 Componentes Principales

### Login Component

**Funcionalidades:**
- Formulario de autenticación
- Setup inicial de administrador
- Manejo de errores
- Credenciales de demo
- Diseño responsive con gradientes

**Características:**
- Validación de campos requeridos
- Estados de carga
- Mensajes de error descriptivos
- Opción de crear primer admin

```tsx
// Credenciales por defecto
username: "admin"
password: "admin123"
```

### Dashboard Component

**Funcionalidades:**
- Panel de control principal
- Navegación por tabs
- CRUD completo para entidades
- Control de acceso por roles
- Estados de sistema en vivo

**Secciones:**
- **Inicio**: Overview del sistema y acciones rápidas
- **Centros**: Gestión de centros médicos (solo admin)
- **Usuarios**: Gestión de usuarios del sistema (solo admin)
- **Consultas**: Gestión de consultas médicas

### Manejo de Roles

```typescript
// Control de acceso en UI
{isAdmin && (
  <button onClick={() => setActiveTab('centros')}>
    🏥 Gestionar Centros
  </button>
)}

// Diferentes vistas por rol
<h4>📋 Consultas {isMedico ? '(Solo tu centro)' : ''}</h4>
```

## 🌐 Servicios de API

### Cliente HTTP Configurado

```typescript
// Interceptor para tokens automáticos
adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Manejo automático de errores 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### APIs Disponibles

#### authAPI
```typescript
// Autenticación via Gateway o Admin directa
login(username, password)           // Login principal
validate(token)                     // Validar token JWT
validateDirect(username, password)  // Fallback directo
```

#### adminAPI
```typescript
// Gestión de centros
getCentros()                        // Listar centros
createCentro(data)                  // Crear centro

// Gestión de usuarios
getUsuarios()                       // Listar usuarios
createUsuario(data)                 // Crear usuario

// Gestión de empleados
getEmpleados()                      // Listar empleados
createEmpleado(data)                // Crear empleado

// Gestión de médicos
getMedicos()                        // Listar médicos
createMedico(data)                  // Crear médico

// Gestión de especialidades
getEspecialidades()                 // Listar especialidades
createEspecialidad(data)            // Crear especialidad
```

#### consultasAPI
```typescript
// Gestión de consultas
getConsultas()                      // Listar consultas
createConsulta(data)                // Crear consulta
getReportByDoctor(doctorId)         // Reporte por médico
```

#### setupAPI
```typescript
// Configuración inicial
createInitialAdmin(data)            // Crear primer admin
```

## 🎨 Diseño y Estilos

### Sistema de Colores
```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Estados de sistema */
.status-indicator.online { color: #28a745; }   /* Verde */
.status-indicator.offline { color: #dc3545; }  /* Rojo */

/* Badges de roles */
.role-badge.admin { background-color: #dc3545; }     /* Rojo */
.role-badge.medico { background-color: #007bff; }    /* Azul */
.role-badge.empleado { background-color: #6c757d; }  /* Gris */
```

### Responsive Design
- **Desktop**: Layout completo con sidebar y grid
- **Tablet**: Adaptación de grid y navegación
- **Mobile**: Stack vertical y navegación simplificada

```css
@media (max-width: 768px) {
  .dashboard-header { flex-direction: column; }
  .form-row { grid-template-columns: 1fr; }
  .action-buttons { grid-template-columns: 1fr; }
}
```

## 📊 Funcionalidades por Rol

### Administrador
- ✅ Gestionar centros médicos
- ✅ Crear y administrar usuarios
- ✅ Ver todas las consultas
- ✅ Gestionar empleados y médicos
- ✅ Gestionar especialidades
- ✅ Reportes completos

### Médico
- ✅ Ver consultas de su centro
- ✅ Crear nuevas consultas
- ✅ Ver reportes de su centro
- ❌ Gestión administrativa (centros, usuarios)

### Empleado
- ❌ Sin acceso implementado actualmente
- 🔄 Funcionalidades futuras

## 🔄 Estados de la Aplicación

### Estado de Autenticación
```typescript
// No autenticado
user: null, token: null, isAuthenticated: false

// Autenticado como admin
user: { id: 1, username: "admin", role: "admin", centroId: null }
token: "eyJhbGciOiJIUzI1NiIs...", isAuthenticated: true

// Autenticado como médico
user: { id: 2, username: "doctor1", role: "medico", centroId: 1 }
token: "eyJhbGciOiJIUzI1NiIs...", isAuthenticated: true
```

### Estados de Carga
```typescript
// Durante operaciones async
loading: true              // Mostrar spinner
error: ""                 // Limpiar errores previos

// Después de completar
loading: false            // Ocultar spinner
error: "mensaje de error" // Mostrar error si hay
```

## 🧪 Testing y Debugging

### Testing Manual

1. **Login como Admin**
   ```
   Username: admin
   Password: admin123
   ```

2. **Crear Centro**
   ```json
   {
     "nombre": "Hospital Test",
     "direccion": "Av. Test 123",
     "ciudad": "Quito",
     "telefono": "02-2345678"
   }
   ```

3. **Crear Usuario Médico**
   ```json
   {
     "username": "doctor1",
     "password": "password123",
     "role": "medico",
     "centroId": 1
   }
   ```

### DevTools y Debugging

```javascript
// Ver token en localStorage
localStorage.getItem('token')

// Ver estado de autenticación
console.log(AuthContext)

// Ver requests de red
// Abrir DevTools -> Network tab
```

### Manejo de Errores

```typescript
// Error handling en componentes
try {
  await adminAPI.createCentro(data);
  alert('Centro creado exitosamente');
} catch (err: any) {
  setError(err.response?.data?.message || 'Error creating centro');
}
```

## 📱 Características de UX

### Feedback Visual
- **Loading states**: Botones con spinner durante operaciones
- **Success messages**: Alertas de confirmación
- **Error messages**: Banners rojos con descripción clara
- **Empty states**: Mensajes cuando no hay datos

### Navegación Intuitiva
- **Breadcrumbs**: Ubicación actual clara
- **Active states**: Tab activo resaltado
- **Quick actions**: Botones de acceso rápido en overview

### Accesibilidad
- **Semantic HTML**: Uso correcto de elementos semánticos
- **Keyboard navigation**: Navegación con teclado
- **Screen reader friendly**: Labels descriptivos
- **Color contrast**: Colores con contraste adecuado

## 🚧 Desarrollo

### Estructura de Desarrollo
```bash
# Instalar dependencias
npm install

# Modo desarrollo (auto-reload)
npm start

# Aplicación disponible en http://localhost:3001
```

### Agregar Nueva Funcionalidad

1. **Nuevo Componente**: Crear en `src/components/`
2. **Servicio API**: Agregar funciones en `src/services/api.ts`
3. **Rutas**: Agregar en `App.tsx`
4. **Estilos**: CSS modules o archivos .css dedicados

### Hot Reload
Los cambios en código se reflejan automáticamente sin perder estado de autenticación.

## 📞 Soporte y Troubleshooting

### Problemas Comunes

1. **Error de CORS**
   - Verificar que las APIs tengan CORS configurado
   - Confirmar URLs en variables de entorno

2. **Token inválido**
   - Verificar que JWT_SECRET coincida entre APIs
   - Limpiar localStorage: `localStorage.clear()`

3. **APIs no responden**
   - Verificar que Docker containers estén corriendo
   - Revisar puertos: 3000 (Admin), 4000 (Consultas), 5158 (Gateway)

### Logs y Debugging

```javascript
// Habilitar logging detallado
localStorage.setItem('debug', 'true');

// Ver estado de autenticación
console.log('Auth State:', {
  user: AuthContext.user,
  token: AuthContext.token,
  isAuthenticated: AuthContext.isAuthenticated
});
```

### Reset Completo

```javascript
// Limpiar estado completo
localStorage.clear();
window.location.reload();
```

## 🔄 Roadmap

### Funcionalidades Futuras
- [ ] Notificaciones push
- [ ] Calendario de consultas
- [ ] Chat entre médicos
- [ ] Reportes avanzados con gráficos
- [ ] Modo offline con PWA
- [ ] Internacionalización (i18n)

### Mejoras Técnicas
- [ ] Tests unitarios con Jest + Testing Library
- [ ] Tests E2E con Cypress
- [ ] Storybook para componentes
- [ ] Bundle analysis y optimización
- [ ] Service Worker para cache

---

**Nota**: Esta interfaz consume las APIs del sistema hospitalario. Para funcionamiento completo, asegurar que Admin API, Consultas API y/o Gateway estén ejecutándose.