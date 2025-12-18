# Guía de Funcionalidad ADMIN

## 🎯 Descripción

El sistema incluye un rol **ADMIN** que permite gestionar coaches y atletas desde el frontend. Los administradores tienen acceso completo para crear, listar y eliminar coaches y atletas.

## 🔑 Roles del Sistema

1. **ADMIN**: Gestiona el sistema completo (coaches, atletas, usuarios)
2. **COACH**: Gestiona sus atletas y WODs
3. **ATHLETE**: Accede a sus entrenamientos y métricas

## 📋 Endpoints de ADMIN

Todos los endpoints requieren autenticación y rol ADMIN.

### Autenticación

#### Registrar Admin

```http
POST /auth/register-admin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "tu_password_seguro",
  "phone": "+541112345678"
}
```

**Nota de Seguridad**: En producción, este endpoint debería:

- Estar protegido con guard adicional
- Requerir token de invitación
- O deshabilitarse después de crear el primer admin

**Respuesta**:

```json
{
  "user": {
    "id": "clxxx...",
    "email": "admin@example.com",
    "role": "ADMIN",
    "phone": "+541112345678",
    "createdAt": "2025-01-27T...",
    "updatedAt": "2025-01-27T..."
  },
  "role": "ADMIN"
}
```

La cookie `access_token` se establece automáticamente.

---

### Gestión de Coaches

#### Listar todos los coaches

```http
GET /admin/coaches
Cookie: access_token=...
```

**Respuesta**:

```json
[
  {
    "id": "clxxx...",
    "email": "coach@example.com",
    "role": "COACH",
    "phone": "+541187654321",
    "createdAt": "2025-01-27T...",
    "coach": {
      "id": "clxxx...",
      "userId": "clxxx..."
    },
    "coachAthletes": [
      {
        "id": "clxxx...",
        "fullName": "Juan Pérez",
        "user": {
          "id": "clxxx...",
          "email": "juan@example.com"
        }
      }
    ]
  }
]
```

#### Crear un coach

```http
POST /admin/coaches
Cookie: access_token=...
Content-Type: application/json

{
  "email": "nuevo-coach@example.com",
  "password": "password_seguro",
  "phone": "+541187654321"
}
```

**Respuesta**:

```json
{
  "id": "clxxx...",
  "email": "nuevo-coach@example.com",
  "role": "COACH",
  "phone": "+541187654321",
  "coach": {
    "id": "clxxx...",
    "userId": "clxxx..."
  }
}
```

#### Eliminar un coach

```http
DELETE /admin/coaches/:userId
Cookie: access_token=...
```

**Respuesta**:

```json
{
  "message": "Coach eliminado correctamente",
  "id": "clxxx..."
}
```

**Nota**: Al eliminar un coach con `CASCADE`, también se elimina su perfil automáticamente.

---

### Gestión de Atletas

#### Listar todos los atletas

```http
GET /admin/athletes
Cookie: access_token=...
```

**Respuesta**:

```json
[
  {
    "id": "clxxx...",
    "userId": "clxxx...",
    "fullName": "Juan Pérez",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "active": true,
    "user": {
      "id": "clxxx...",
      "email": "juan@example.com",
      "phone": "+541198765432",
      "role": "ATHLETE",
      "createdAt": "2025-01-27T...",
      "updatedAt": "2025-01-27T..."
    },
    "coach": {
      "id": "clxxx...",
      "email": "coach@example.com"
    },
    "metrics": [...]
  }
]
```

#### Obtener detalles de un atleta

```http
GET /admin/athletes/:athleteId
Cookie: access_token=...
```

**Respuesta**: Similar a la lista pero con más detalles, incluyendo:

- Todas las métricas
- Actividades
- Pagos

#### Eliminar un atleta

```http
DELETE /admin/athletes/:userId
Cookie: access_token=...
```

**Respuesta**:

```json
{
  "message": "Atleta eliminado correctamente",
  "id": "clxxx..."
}
```

---

### Gestión de Usuarios

#### Listar todos los usuarios

```http
GET /admin/users
Cookie: access_token=...
```

**Respuesta**:

```json
[
  {
    "id": "clxxx...",
    "email": "user@example.com",
    "role": "COACH",
    "phone": "+541112345678",
    "createdAt": "2025-01-27T...",
    "athlete": null,
    "coach": {
      "id": "clxxx...",
      "userId": "clxxx..."
    }
  },
  {
    "id": "clxxx...",
    "email": "athlete@example.com",
    "role": "ATHLETE",
    "athlete": {
      "id": "clxxx...",
      "fullName": "Juan Pérez"
    },
    "coach": null
  }
]
```

#### Obtener detalles de un usuario

```http
GET /admin/users/:userId
Cookie: access_token=...
```

**Respuesta**: Datos completos del usuario incluyendo:

- Perfil de athlete o coach
- Relaciones (atletas del coach, coach del atleta)
- Métricas y pagos (si es atleta)

---

## 🔒 Seguridad

### Guards Aplicados

Todos los endpoints de admin están protegidos con:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
```

Esto asegura que:

1. El usuario debe estar autenticado (JWT válido)
2. El usuario debe tener rol ADMIN

### Respuestas de Error

#### Sin autenticación

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Rol incorrecto

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

## 🧪 Pruebas

Ejecutar el script de pruebas:

```bash
node test-admin.js
```

El script prueba:

1. ✅ Registro de admin
2. ✅ Autenticación con cookies
3. ✅ Creación de coach desde panel admin
4. ✅ Listado de coaches
5. ✅ Listado de usuarios
6. ✅ Listado de atletas
7. ✅ Protección sin autenticación (401)
8. ✅ Logout
9. ✅ Protección después de logout (401)

---

## 📱 Uso desde el Frontend

### Crear Admin (una sola vez, setup inicial)

```typescript
const registerAdmin = async () => {
  const response = await fetch('http://localhost:3000/auth/register-admin', {
    method: 'POST',
    credentials: 'include', // Importante para cookies
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@mybox.com',
      password: 'admin_password',
      phone: '+541112345678',
    }),
  });

  const data = await response.json();
  console.log('Admin creado:', data);
};
```

### Login como Admin

```typescript
const loginAdmin = async () => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@mybox.com',
      password: 'admin_password',
    }),
  });

  const data = await response.json();
  console.log('Logged in as:', data.role); // "ADMIN"
};
```

### Crear Coach desde Panel Admin

```typescript
const createCoach = async () => {
  const response = await fetch('http://localhost:3000/admin/coaches', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'coach@example.com',
      password: 'coach_password',
      phone: '+541187654321',
    }),
  });

  const coach = await response.json();
  console.log('Coach creado:', coach);
};
```

### Listar Coaches

```typescript
const listCoaches = async () => {
  const response = await fetch('http://localhost:3000/admin/coaches', {
    method: 'GET',
    credentials: 'include',
  });

  const coaches = await response.json();
  console.log('Coaches:', coaches);
};
```

### Listar Atletas

```typescript
const listAthletes = async () => {
  const response = await fetch('http://localhost:3000/admin/athletes', {
    method: 'GET',
    credentials: 'include',
  });

  const athletes = await response.json();
  console.log('Atletas:', athletes);
};
```

### Eliminar Coach

```typescript
const deleteCoach = async (userId: string) => {
  const response = await fetch(
    `http://localhost:3000/admin/coaches/${userId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  );

  const result = await response.json();
  console.log('Coach eliminado:', result);
};
```

---

## 🎨 Componente React de Ejemplo

```typescript
import { useState, useEffect } from 'react';

interface Coach {
  id: string;
  email: string;
  phone: string;
  role: string;
}

export function AdminDashboard() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/coaches', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al cargar coaches');

      const data = await response.json();
      setCoaches(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoach = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/admin/coaches', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Error al crear coach');

      await fetchCoaches(); // Recargar lista
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteCoach = async (userId: string) => {
    if (!confirm('¿Eliminar este coach?')) return;

    try {
      const response = await fetch(`http://localhost:3000/admin/coaches/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al eliminar coach');

      await fetchCoaches(); // Recargar lista
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Panel de Administración</h1>
      <h2>Coaches</h2>
      <ul>
        {coaches.map(coach => (
          <li key={coach.id}>
            {coach.email} - {coach.phone}
            <button onClick={() => handleDeleteCoach(coach.id)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## ⚙️ Estructura de Archivos

```
src/
├── admin/
│   ├── admin.controller.ts   # Endpoints de admin
│   ├── admin.service.ts       # Lógica de negocio
│   └── admin.module.ts        # Módulo de admin
├── auth/
│   ├── auth.controller.ts     # Incluye POST /auth/register-admin
│   ├── auth.service.ts        # Incluye registerAdmin()
│   ├── roles.guard.ts         # Guard de roles
│   └── roles.decorator.ts     # @Roles() decorator
└── app.module.ts              # Importa AdminModule
```

---

## 🚀 Próximos Pasos

1. **Producción**: Proteger `/auth/register-admin` con token de invitación
2. **UI**: Crear panel de administración en el frontend
3. **Auditoría**: Agregar logs de acciones administrativas
4. **Permisos**: Considerar permisos más granulares si es necesario
