# 🔐 Sistema de Autenticación JWT

## Descripción General

Sistema completo de autenticación con JWT (JSON Web Tokens) para login de **Coaches** y **Atletas**.

---

## 📦 Dependencias Instaladas

```json
{
  "@nestjs/jwt": "^11.0.1",
  "@nestjs/passport": "^11.0.5",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "bcrypt": "^6.0.0"
}
```

---

## 🛠️ Estructura del Módulo Auth

```
src/auth/
├── auth.module.ts          # Módulo principal
├── auth.service.ts         # Lógica de autenticación
├── auth.controller.ts      # Endpoints de auth
├── jwt.strategy.ts         # Estrategia JWT de Passport
├── jwt-auth.guard.ts       # Guard para proteger rutas
├── roles.guard.ts          # Guard para validar roles
└── roles.decorator.ts      # Decorador @Roles()
```

---

## 🔑 Endpoints Disponibles

### 1. Login (Coach o Atleta)

```http
POST /auth/login
Content-Type: application/json

{
  "email": "coach@example.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "user": {
    "id": "clxxx...",
    "email": "coach@example.com",
    "role": "COACH",
    "phone": "123456789",
    "createdAt": "2025-10-24T...",
    "updatedAt": "2025-10-24T...",
    "athlete": null,
    "coach": {
      "id": "clyyy...",
      "userId": "clxxx..."
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "COACH"
}
```

### 2. Registro de Coach

```http
POST /auth/register-coach
Content-Type: application/json

{
  "email": "nuevo-coach@example.com",
  "password": "123456",
  "phone": "987654321"
}
```

**Response:** (mismo formato que login)

### 3. Obtener Perfil del Usuario Autenticado

```http
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "id": "clxxx...",
  "email": "coach@example.com",
  "role": "COACH",
  "phone": "123456789",
  "athlete": null,
  "coach": {
    "id": "clyyy...",
    "userId": "clxxx..."
  }
}
```

### 4. Registro de Atleta (ya existente)

```http
POST /athletes
Content-Type: application/json

{
  "email": "atleta@example.com",
  "password": "123456",
  "fullName": "Juan Pérez",
  "phone": "123456789",
  "coachId": "clxxx..."
}
```

**Nota:** Después de crear el atleta, el usuario debe hacer login en `/auth/login`.

### 5. Recuperación de Contraseña

#### Solicitar Reset

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

**Response:**
```json
{
  "message": "Si el email existe, se enviarán las instrucciones."
}
```

#### Resetear Contraseña

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "token_recibido_por_email",
  "newPassword": "nueva_password_segura"
}
```

**Response:**
```json
{
  "message": "Contraseña actualizada correctamente"
}
```

---

## 🔒 Proteger Rutas con JWT

### Ejemplo 1: Proteger una ruta (requiere estar autenticado)

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mi-ruta')
export class MiController {
  @UseGuards(JwtAuthGuard)
  @Get('protegida')
  rutaProtegida() {
    return { message: 'Solo usuarios autenticados' };
  }
}
```

### Ejemplo 2: Proteger por rol (solo coaches)

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('coaches-only')
export class CoachesController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COACH')
  @Get()
  soloCoaches() {
    return { message: 'Solo coaches pueden ver esto' };
  }
}
```

### Ejemplo 3: Obtener usuario autenticado

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mi-perfil')
export class PerfilController {
  @UseGuards(JwtAuthGuard)
  @Get()
  miPerfil(@Request() req: any) {
    // req.user contiene el usuario autenticado
    return {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
    };
  }
}
```

---

## 🎯 Flujo de Autenticación

### 1. Usuario hace Login

```mermaid
sequenceDiagram
    Frontend->>Backend: POST /auth/login {email, password}
    Backend->>DB: Buscar usuario por email
    DB-->>Backend: Usuario encontrado
    Backend->>Backend: Validar contraseña (bcrypt)
    Backend->>Backend: Generar JWT token
    Backend-->>Frontend: {user, token, role}
    Frontend->>Frontend: Guardar token en localStorage
```

### 2. Usuario hace Request Autenticado

```mermaid
sequenceDiagram
    Frontend->>Backend: GET /api/ruta-protegida<br/>Authorization: Bearer <token>
    Backend->>JWT Strategy: Validar token
    JWT Strategy->>DB: Buscar usuario por ID del token
    DB-->>JWT Strategy: Usuario encontrado
    JWT Strategy-->>Backend: Usuario válido
    Backend-->>Frontend: Respuesta exitosa
```

---

## 💻 Uso desde el Frontend

### 1. Login

```typescript
// Login de coach o atleta
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    // Guardar token en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } else {
    throw new Error('Credenciales inválidas');
  }
};
```

### 2. Hacer Requests Autenticados

```typescript
// Obtener perfil del usuario
const getProfile = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return await response.json();
};

// Cualquier otra ruta protegida
const fetchProtectedData = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/api/ruta-protegida', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};
```

### 3. Logout

```typescript
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
  // Redirigir a login
  window.location.href = '/login';
};
```

### 4. Verificar si está autenticado

```typescript
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const getRole = () => {
  return localStorage.getItem('role'); // 'COACH' o 'ATHLETE'
};
```

---

## 🔐 Seguridad

### Contraseñas Hasheadas con Bcrypt

```typescript
// Al crear usuario (automático en AuthService y AthletesService)
const hashedPassword = await bcrypt.hash(password, 10);

// Al validar login (automático en AuthService)
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### JWT Secret

Configurado en `.env`:

```env
JWT_SECRET="dev_secret_change_me"
```

**⚠️ IMPORTANTE:** En producción, usa un secret largo y aleatorio:

```bash
# Generar secret seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Expiración del Token

Por defecto: **7 días** (configurable en `auth.module.ts`)

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '7d' }, // ← Cambiar aquí
}),
```

---

## 🧪 Testing con Thunder Client / Postman

### 1. Login como Coach

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "coach@test.com",
  "password": "123456"
}
```

### 2. Guardar el token

Copiar el `token` de la respuesta.

### 3. Usar el token en requests

```http
GET http://localhost:3000/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 Checklist de Implementación

- ✅ Módulo Auth creado
- ✅ JWT Strategy implementada
- ✅ Guards (JwtAuthGuard, RolesGuard) creados
- ✅ Endpoints de login y registro
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Token JWT con expiración de 7 días
- ✅ Endpoint `/auth/me` para obtener perfil
- ✅ Decorador `@Roles()` para proteger por rol
- ✅ AthletesService actualizado para hashear passwords

---

## 🚀 Próximos Pasos (Opcional)

### 1. Refresh Tokens

Implementar refresh tokens para renovar el access token sin hacer login nuevamente.

### 2. Forgot Password

Endpoint para resetear contraseña vía email.

### 3. Email Verification

Verificar email al registrarse.

### 4. Rate Limiting

Limitar intentos de login para prevenir ataques de fuerza bruta.

---

## 🐛 Troubleshooting

### Error: "Unauthorized"

- Verificar que el token esté en el header: `Authorization: Bearer <token>`
- Verificar que el token no haya expirado (7 días)
- Verificar que el `JWT_SECRET` sea el mismo en todas las instancias

### Error: "Usuario no encontrado"

- El usuario fue eliminado de la base de datos
- El ID en el token no existe

### Error: "Credenciales inválidas"

- Email o password incorrectos
- Verificar que la contraseña esté hasheada en la DB

---

## 📚 Referencias

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [JWT.io](https://jwt.io/)
