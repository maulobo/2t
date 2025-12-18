# Actualización de Tipos para Coincidir con Schema Prisma

## Cambios Realizados

### 1. **CreateAthleteDto**
Actualizado para coincidir con la estructura User + AthleteProfile:

```typescript
export interface CreateAthleteDto {
  // Datos del User
  email: string;
  password: string;
  phone?: string;
  
  // Datos del AthleteProfile
  fullName: string;
  birthDate?: string; // DateTime en Prisma -> string en JSON
  notes?: string;
  coachId?: string; // Opcional según el schema
}
```

### 2. **Athlete Interface**
Actualizada para reflejar AthleteProfile + User relations:

```typescript
export interface Athlete {
  // AthleteProfile fields
  id: string;
  userId: string;
  fullName: string;
  birthDate: string | null;
  notes: string | null;
  active: boolean;
  coachId: string | null; // Nullable en schema
  
  // User relation
  user: {
    id: string;
    email: string;
    phone: string | null;
    role: 'ATHLETE';
    createdAt: string;
    updatedAt: string;
  };
  
  // Coach relation (User con role COACH)
  coach?: {
    id: string;
    email: string;
    role: 'COACH';
  };
  
  // Relations
  payments: Payment[];
  assignments?: Assignment[];
  
  // Aggregations
  _count?: {
    payments: number;
    assignments: number;
  };
}
```

### 3. **WOD Interface**
Actualizada según schema Prisma:

```typescript
export interface WOD {
  id: string;
  title: string;        // Era "name" antes
  description: string;
  date: string;
  track: string | null; // Nuevo campo
  createdById: string;  // Nuevo campo
  
  createdBy?: {
    id: string;
    email: string;
    role: 'COACH';
  };
}
```

### 4. **Assignment Interface**
Actualizada para coincidir con WODAssignment:

```typescript
export interface Assignment {
  id: string;
  wodId: string;
  athleteId: string;
  
  wod: {
    id: string;
    title: string;
    description: string;
    date: string;
    track: string | null;
    createdById: string;
  };
}
```

### 5. **Formulario CreateAthleteForm**
- `coachId` ahora es opcional (sin valor por defecto)
- Se estructura correctamente el DTO para el backend
- Se eliminaron los emojis

## Backend Esperado

Según tu schema, el backend debería:

### Endpoint: `POST /athletes`
```typescript
// Request body
{
  email: string;
  password: string;
  phone?: string;
  fullName: string;
  birthDate?: string; // ISO string
  notes?: string;
  coachId?: string;
}

// Backend implementation (aproximado)
async create(data) {
  return this.prisma.user.create({
    data: {
      email: data.email,
      password: data.password, // Ya hasheada
      phone: data.phone,
      role: 'ATHLETE',
      athlete: {
        create: {
          fullName: data.fullName,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          notes: data.notes,
          coachId: data.coachId,
        },
      },
    },
    include: {
      athlete: {
        include: {
          coach: true,
          payments: true,
          assignments: {
            include: {
              wod: true
            }
          }
        }
      },
    },
  });
}
```

### Respuesta esperada:
```json
{
  "id": "user-cuid",
  "email": "juan@ejemplo.com",
  "phone": "+54911234567",
  "role": "ATHLETE",
  "createdAt": "2025-10-20T...",
  "updatedAt": "2025-10-20T...",
  "athlete": {
    "id": "athlete-cuid",
    "userId": "user-cuid",
    "fullName": "Juan Pérez",
    "birthDate": "1990-05-15T00:00:00Z",
    "notes": null,
    "active": true,
    "coachId": "coach-cuid",
    "coach": { ... },
    "payments": [],
    "assignments": []
  }
}
```

## Diferencias Principales con Versión Anterior

1. **Separación User/AthleteProfile**: Antes era una sola entidad, ahora respeta la separación del schema
2. **coachId opcional**: Antes era requerido, ahora es opcional según schema
3. **WOD.title**: Era "name", ahora es "title" como en schema
4. **WOD.track**: Nuevo campo agregado
5. **Assignment simplificado**: Solo WODAssignment básico sin referencias circulares
6. **Sin emojis**: Eliminados todos los emojis del código

## Próximos Pasos

1. **Verificar endpoint backend**: Asegúrate que el backend maneje correctamente la estructura User + AthleteProfile
2. **Hashear contraseña**: El backend debe hashear la contraseña antes de guardar
3. **Validar phone unique**: El schema tiene `@unique` en phone, manejar conflictos
4. **Contexto de usuario**: Implementar contexto para obtener coachId automáticamente
5. **Probar creación**: Verificar que la respuesta del backend coincida con la interfaz Athlete actualizada