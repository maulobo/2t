# API Documentation - Backend Gym Management

**Base URL:** `http://localhost:3000`  
**Version:** 1.0  
**Fecha:** Octubre 2025

---

## 📋 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Usuarios y Coaches](#usuarios-y-coaches)
3. [Atletas](#atletas)
4. [Pagos](#pagos)
5. [WODs](#wods)
6. [Tipos de Datos](#tipos-de-datos)
7. [Códigos de Error](#códigos-de-error)
8. [Ejemplos de Integración](#ejemplos-de-integración)

---

## 🔐 Autenticación

**Estado actual:** No implementada aún  
**TODO:** Implementar JWT + bcrypt para passwords  
Por ahora, todos los endpoints son públicos.

---

## 👥 Usuarios y Coaches

### 1. Crear un Coach

**Endpoint:** `POST /users/coach`

**Request Body:**
```json
{
  "email": "coach@gym.com",
  "password": "Coach123!",
  "phone": "+5491122334455"
}
```

**Response (201 Created):**
```json
{
  "id": "cmgv8jomi00009kikv9i2os3z",
  "email": "coach@gym.com",
  "role": "COACH",
  "phone": "+5491122334455",
  "createdAt": "2025-10-17T...",
  "coach": {
    "id": "coach_profile_id",
    "userId": "cmgv8jomi00009kikv9i2os3z"
  }
}
```

**Errores:**
- `409 Conflict` - Email o teléfono ya existe
- `400 Bad Request` - Validación fallida

---

### 2. Listar Coaches

**Endpoint:** `GET /users/coaches`

**Response (200 OK):**
```json
[
  {
    "id": "cmgv8jomi00009kikv9i2os3z",
    "email": "coach@gym.com",
    "role": "COACH",
    "phone": "+5491122334455",
    "coach": {
      "id": "...",
      "userId": "..."
    }
  }
]
```

---

## 🏃 Atletas

### 1. Crear un Atleta

**Endpoint:** `POST /athletes`

**Request Body:**
```json
{
  "email": "atleta@gym.com",
  "password": "Atleta123!",
  "phone": "+5491199887766",
  "fullName": "Juan Pérez",
  "birthDate": "1995-03-15",
  "coachId": "cmgv8jomi00009kikv9i2os3z",
  "notes": "Horarios: L/M/V 18:00"
}
```

**Campos:**
- `email` (string, required) - Email único
- `password` (string, required) - Mínimo 8 caracteres
- `phone` (string, optional) - Teléfono único
- `fullName` (string, required) - Nombre completo
- `birthDate` (string ISO, optional) - Fecha de nacimiento
- `coachId` (string, required) - ID del coach
- `notes` (string, optional) - Notas adicionales

**Response (201 Created):**
```json
{
  "id": "user_id",
  "email": "atleta@gym.com",
  "role": "ATHLETE",
  "athlete": {
    "id": "cmgv8jon800049kik6lxxkrqq",
    "fullName": "Juan Pérez",
    "birthDate": "1995-03-15T00:00:00.000Z",
    "coachId": "cmgv8jomi00009kikv9i2os3z",
    "active": true,
    "notes": "Horarios: L/M/V 18:00"
  }
}
```

**Errores:**
- `409 Conflict` - Email o teléfono ya existe
- `400 Bad Request` - Validación fallida
- `404 Not Found` - CoachId no existe

**⚠️ IMPORTANTE:** Guardar `athlete.id` (NO `user.id`) para usar en pagos.

---

### 2. Listar Atletas de un Coach

**Endpoint:** `GET /athletes/coach/:coachId`

**Ejemplo:** `GET /athletes/coach/cmgv8jomi00009kikv9i2os3z`

**Response (200 OK):**
```json
[
  {
    "id": "cmgv8jon800049kik6lxxkrqq",
    "userId": "cmgv8jon800029kik8vgfot9b",
    "fullName": "Juan Pérez",
    "birthDate": "1995-03-15T00:00:00.000Z",
    "notes": "Horarios: L/M/V 18:00",
    "active": true,
    "coachId": "cmgv8jomi00009kikv9i2os3z",
    "user": {
      "email": "atleta@gym.com",
      "phone": "+5491100000001"
    },
    "payments": [
      {
        "id": "payment_id",
        "amount": 8000000,
        "status": "APPROVED",
        "periodStart": "2025-10-01T00:00:00.000Z",
        "periodEnd": "2025-10-31T00:00:00.000Z"
      }
    ]
  }
]
```

---

### 3. Obtener Detalle de un Atleta

**Endpoint:** `GET /athletes/:id`

**Ejemplo:** `GET /athletes/cmgv8jon800049kik6lxxkrqq`

**Response (200 OK):**
```json
{
  "id": "cmgv8jon800049kik6lxxkrqq",
  "fullName": "Juan Pérez",
  "birthDate": "1995-03-15T00:00:00.000Z",
  "notes": "Horarios: L/M/V 18:00",
  "active": true,
  "user": {
    "id": "...",
    "email": "atleta@gym.com",
    "phone": "+5491100000001"
  },
  "payments": [
    {
      "id": "...",
      "amount": 8000000,
      "status": "APPROVED",
      "periodStart": "2025-10-01T00:00:00.000Z",
      "periodEnd": "2025-10-31T00:00:00.000Z",
      "createdAt": "2025-10-17T...",
      "approvedAt": "2025-10-17T..."
    }
  ],
  "assignments": [
    {
      "id": "...",
      "wod": {
        "id": "...",
        "title": "Chipper",
        "date": "2025-10-17T..."
      }
    }
  ]
}
```

**Errores:**
- `404 Not Found` - Atleta no existe

---

### 4. Actualizar un Atleta

**Endpoint:** `PATCH /athletes/:id`

**Request Body (todos opcionales):**
```json
{
  "fullName": "Juan Carlos Pérez",
  "birthDate": "1995-03-15",
  "notes": "Nuevos horarios: L/M/J 19:00",
  "active": true
}
```

**Response (200 OK):**
```json
{
  "id": "cmgv8jon800049kik6lxxkrqq",
  "fullName": "Juan Carlos Pérez",
  "birthDate": "1995-03-15T00:00:00.000Z",
  "notes": "Nuevos horarios: L/M/J 19:00",
  "active": true
}
```

---

### 5. Verificar Estado de Pago

**Endpoint:** `GET /athletes/:id/payment-status`

**Ejemplo:** `GET /athletes/cmgv8jon800049kik6lxxkrqq/payment-status`

**Response (200 OK):**
```json
{
  "isPaid": true,
  "payment": {
    "id": "...",
    "amount": 8000000,
    "status": "APPROVED",
    "periodStart": "2025-10-01T00:00:00.000Z",
    "periodEnd": "2025-10-31T00:00:00.000Z"
  }
}
```

**Si no está al día:**
```json
{
  "isPaid": false,
  "payment": null
}
```

**⚠️ Importante:** Este endpoint verifica si hay un pago `APPROVED` que cubra la fecha actual (hoy).

---

## 💰 Pagos

### 1. Crear un Pago

**Endpoint:** `POST /payments`

**Request Body:**
```json
{
  "athleteId": "cmgv8jon800049kik6lxxkrqq",
  "amount": 80000,
  "periodStart": "2025-10-01",
  "periodEnd": "2025-10-31",
  "evidenceUrl": "https://storage.example.com/comprobante.jpg",
  "evidenceText": "Transferencia Banco Nación"
}
```

**Campos:**
- `athleteId` (string, required) - ID del AthleteProfile (⚠️ NO del User)
- `amount` (number, required) - Monto en PESOS (se convierte a centavos automáticamente)
- `periodStart` (string ISO, required) - Inicio del periodo
- `periodEnd` (string ISO, required) - Fin del periodo
- `evidenceUrl` (string, optional) - URL de la evidencia
- `evidenceText` (string, optional) - Descripción del pago

**Response (201 Created):**
```json
{
  "id": "cmgv8r18m00059kkpcqn2j899",
  "athleteId": "cmgv8jon800049kik6lxxkrqq",
  "amount": 8000000,
  "periodStart": "2025-10-01T00:00:00.000Z",
  "periodEnd": "2025-10-31T00:00:00.000Z",
  "status": "PENDING",
  "createdAt": "2025-10-17T...",
  "approvedAt": null,
  "evidenceUrl": null,
  "evidenceText": "Transferencia Banco Nación",
  "athlete": {
    "id": "...",
    "fullName": "Juan Pérez",
    "user": {
      "email": "atleta@gym.com",
      "phone": "+5491100000001"
    }
  }
}
```

**Errores:**
- `400 Bad Request` - Validación fallida
- `404 Not Found` - AthleteId no existe

---

### 2. Listar Pagos Pendientes

**Endpoint:** `GET /payments/pending`

**Query Params (opcionales):**
- `coachId` - Filtrar por coach específico

**Ejemplo:** `GET /payments/pending?coachId=cmgv8jomi00009kikv9i2os3z`

**Response (200 OK):**
```json
[
  {
    "id": "payment_id",
    "athleteId": "...",
    "amount": 8000000,
    "status": "PENDING",
    "periodStart": "2025-10-01T00:00:00.000Z",
    "periodEnd": "2025-10-31T00:00:00.000Z",
    "evidenceText": "Transferencia",
    "createdAt": "2025-10-17T...",
    "athlete": {
      "fullName": "Juan Pérez",
      "user": {
        "email": "atleta@gym.com",
        "phone": "+5491100000001"
      }
    }
  }
]
```

---

### 3. Listar Pagos de un Atleta

**Endpoint:** `GET /payments/athlete/:athleteId`

**Ejemplo:** `GET /payments/athlete/cmgv8jon800049kik6lxxkrqq`

**Response (200 OK):**
```json
[
  {
    "id": "...",
    "athleteId": "cmgv8jon800049kik6lxxkrqq",
    "amount": 8000000,
    "status": "APPROVED",
    "periodStart": "2025-10-01T00:00:00.000Z",
    "periodEnd": "2025-10-31T00:00:00.000Z",
    "createdAt": "2025-10-17T...",
    "approvedAt": "2025-10-17T...",
    "athlete": {
      "fullName": "Juan Pérez",
      "user": {
        "email": "atleta@gym.com"
      }
    }
  }
]
```

---

### 4. Aprobar un Pago

**Endpoint:** `PATCH /payments/:id/approve`

**Ejemplo:** `PATCH /payments/cmgv8r18m00059kkpcqn2j899/approve`

**Response (200 OK):**
```json
{
  "id": "cmgv8r18m00059kkpcqn2j899",
  "athleteId": "...",
  "amount": 8000000,
  "status": "APPROVED",
  "approvedAt": "2025-10-17T19:28:03.402Z",
  "periodStart": "2025-10-01T00:00:00.000Z",
  "periodEnd": "2025-10-31T00:00:00.000Z"
}
```

---

### 5. Rechazar un Pago

**Endpoint:** `PATCH /payments/:id/reject`

**Ejemplo:** `PATCH /payments/cmgv8r18m00059kkpcqn2j899/reject`

**Response (200 OK):**
```json
{
  "id": "cmgv8r18m00059kkpcqn2j899",
  "status": "REJECTED",
  "...": "..."
}
```

---

### 6. Actualizar Evidencia de Pago

**Endpoint:** `PATCH /payments/:id/evidence`

**Request Body:**
```json
{
  "evidenceUrl": "https://storage.example.com/comprobante123.jpg",
  "evidenceText": "Transferencia confirmada"
}
```

**Response (200 OK):**
```json
{
  "id": "...",
  "evidenceUrl": "https://storage.example.com/comprobante123.jpg",
  "evidenceText": "Transferencia confirmada",
  "...": "..."
}
```

---

## 🏋️ WODs

**Estado:** Módulo existe pero sin endpoints implementados  
**TODO:** Implementar CRUD de WODs y asignaciones

---

## 📊 Tipos de Datos

### Role (enum)
```typescript
type Role = 'COACH' | 'ATHLETE';
```

### PaymentStatus (enum)
```typescript
type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
```

### User
```typescript
interface User {
  id: string;
  email: string;
  password: string; // TODO: hashear con bcrypt
  role: Role;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### AthleteProfile
```typescript
interface AthleteProfile {
  id: string;
  userId: string;
  fullName: string;
  birthDate?: Date;
  notes?: string;
  active: boolean;
  coachId: string;
}
```

### Payment
```typescript
interface Payment {
  id: string;
  athleteId: string;
  amount: number; // en centavos (80.000 pesos = 8.000.000 centavos)
  periodStart: Date;
  periodEnd: Date;
  status: PaymentStatus;
  createdAt: Date;
  approvedAt?: Date;
  evidenceUrl?: string;
  evidenceText?: string;
}
```

---

## ⚠️ Códigos de Error

| Código | Descripción | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa (GET, PATCH) |
| 201 | Created | Recurso creado (POST) |
| 400 | Bad Request | Validación fallida, campos faltantes |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Email/phone duplicado |
| 500 | Internal Server Error | Error inesperado del servidor |

**Formato de error:**
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

---

## 🔧 Ejemplos de Integración

### Setup inicial (env variables)

```typescript
// .env.local o config
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

---

### Helper para fetch con manejo de errores

```typescript
// lib/api.ts
const API_URL = 'http://localhost:3000';

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}
```

---

### 1. Crear un atleta

```typescript
// lib/athletes.ts
import { fetchAPI } from './api';

export async function createAthlete(data: {
  email: string;
  password: string;
  phone?: string;
  fullName: string;
  birthDate?: string;
  coachId: string;
  notes?: string;
}) {
  return fetchAPI('/athletes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Uso en componente:
const handleSubmit = async (formData) => {
  try {
    const athlete = await createAthlete(formData);
    toast.success('Atleta creado exitosamente');
    router.push(`/athletes/${athlete.athlete.id}`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      toast.error('El email o teléfono ya está registrado');
    } else {
      toast.error('Error al crear atleta');
    }
  }
};
```

---

### 2. Listar atletas de un coach

```typescript
// hooks/useAthletes.ts
import useSWR from 'swr';
import { fetchAPI } from '@/lib/api';

export function useAthletes(coachId: string) {
  const { data, error, mutate } = useSWR(
    `/athletes/coach/${coachId}`,
    fetchAPI
  );

  return {
    athletes: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

// Uso en componente:
function AthletesList({ coachId }) {
  const { athletes, isLoading } = useAthletes(coachId);

  if (isLoading) return <Spinner />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {athletes.map(athlete => (
        <AthleteCard key={athlete.id} athlete={athlete} />
      ))}
    </div>
  );
}
```

---

### 3. Crear y aprobar pago

```typescript
// lib/payments.ts
export async function createPayment(data: {
  athleteId: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  evidenceText?: string;
}) {
  return fetchAPI('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function approvePayment(paymentId: string) {
  return fetchAPI(`/payments/${paymentId}/approve`, {
    method: 'PATCH',
  });
}

export async function rejectPayment(paymentId: string) {
  return fetchAPI(`/payments/${paymentId}/reject`, {
    method: 'PATCH',
  });
}

// Uso en componente:
function PaymentCard({ payment, onUpdate }) {
  const handleApprove = async () => {
    try {
      await approvePayment(payment.id);
      toast.success('Pago aprobado');
      onUpdate();
    } catch (error) {
      toast.error('Error al aprobar pago');
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3>{payment.athlete.fullName}</h3>
      <p>${payment.amount / 100}</p>
      <p>{payment.evidenceText}</p>
      {payment.status === 'PENDING' && (
        <div className="flex gap-2 mt-4">
          <button 
            onClick={handleApprove}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            ✅ Aprobar
          </button>
          <button 
            onClick={handleReject}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            ❌ Rechazar
          </button>
        </div>
      )}
    </div>
  );
}
```

---

### 4. Ver estado de pago del atleta

```typescript
// components/PaymentStatus.tsx
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

export function PaymentStatus({ athleteId }: { athleteId: string }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchAPI(`/athletes/${athleteId}/payment-status`)
      .then(setStatus)
      .catch(console.error);
  }, [athleteId]);

  if (!status) return <Spinner />;

  return (
    <div className={`p-4 rounded-lg ${status.isPaid ? 'bg-green-100' : 'bg-red-100'}`}>
      {status.isPaid ? (
        <>
          <h3 className="text-green-800 font-bold">✅ Al día</h3>
          <p className="text-sm">
            Pagado hasta {new Date(status.payment.periodEnd).toLocaleDateString('es')}
          </p>
        </>
      ) : (
        <>
          <h3 className="text-red-800 font-bold">⚠️ Cuota vencida</h3>
          <p className="text-sm">Por favor realiza tu pago</p>
        </>
      )}
    </div>
  );
}
```

---

### 5. Dashboard de pagos pendientes

```typescript
// app/admin/payments/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { fetchAPI, approvePayment, rejectPayment } from '@/lib/api';

export default function PaymentsDashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    const data = await fetchAPI('/payments/pending');
    setPending(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleApprove = async (id: string) => {
    await approvePayment(id);
    toast.success('Pago aprobado');
    loadPayments();
  };

  const handleReject = async (id: string) => {
    await rejectPayment(id);
    toast.success('Pago rechazado');
    loadPayments();
  };

  if (loading) return <Spinner />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pagos Pendientes</h1>
      
      {pending.length === 0 ? (
        <p className="text-gray-500">No hay pagos pendientes</p>
      ) : (
        <div className="grid gap-4">
          {pending.map(payment => (
            <div key={payment.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{payment.athlete.fullName}</h3>
                  <p className="text-sm text-gray-600">{payment.athlete.user.email}</p>
                  <p className="text-lg font-semibold mt-2">
                    ${(payment.amount / 100).toLocaleString('es-AR')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Periodo: {new Date(payment.periodStart).toLocaleDateString()} 
                    {' - '}
                    {new Date(payment.periodEnd).toLocaleDateString()}
                  </p>
                  {payment.evidenceText && (
                    <p className="text-sm mt-2 italic">{payment.evidenceText}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(payment.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    ✅ Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(payment.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    ❌ Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Flujos Principales

### Flujo 1: Registro de Atleta
1. Admin lista coaches → `GET /users/coaches`
2. Admin crea atleta → `POST /athletes`
3. Sistema redirige a perfil del atleta → `GET /athletes/:id`

### Flujo 2: Gestión de Pagos (Admin)
1. Admin ve pagos pendientes → `GET /payments/pending`
2. Admin revisa evidencia (foto/texto)
3. Admin aprueba → `PATCH /payments/:id/approve`
4. Sistema actualiza estado del atleta

### Flujo 3: Verificación de Pago (Atleta)
1. Atleta accede a su perfil
2. Sistema verifica estado → `GET /athletes/:id/payment-status`
3. Muestra badge "Al día" o "Vencido"

---

## 📝 Notas Importantes

### ⚠️ IDs a tener en cuenta:
- **User ID:** Para autenticación (futuro)
- **AthleteProfile ID:** Para pagos, WODs, etc.
- Siempre usar `athlete.id` (no `user.id`) al crear pagos

### 💰 Manejo de montos:
- Frontend envía en pesos: `80000`
- Backend guarda en centavos: `8000000`
- Frontend muestra dividiendo: `amount / 100`

### 📅 Fechas:
- Enviar en formato ISO: `"2025-10-01"` o `"2025-10-01T00:00:00.000Z"`
- Backend devuelve en ISO: `"2025-10-01T00:00:00.000Z"`

### 🔒 Seguridad (TODO):
- Implementar JWT para autenticación
- Hashear passwords con bcrypt
- Validar permisos (coach solo ve sus atletas)
- CORS configurado para producción

---

## 🚀 Próximos Pasos

1. **Autenticación JWT**
   - Login/logout
   - Refresh tokens
   - Middleware de autenticación

2. **Subida de Evidencias**
   - Endpoint para upload de imágenes
   - Integración con MinIO/S3
   - Preview de comprobantes

3. **WODs**
   - Crear/editar/eliminar WODs
   - Asignar WODs a atletas
   - Registrar scores

4. **Notificaciones**
   - Recordatorios de pago
   - Integración con WhatsApp
   - Templates de mensajes

5. **Reportes**
   - Dashboard de ingresos
   - Atletas morosos
   - Estadísticas mensuales

---

## 📞 Contacto y Soporte

**Backend Developer:** [Tu nombre]  
**Repositorio:** [Link al repo]  
**Documentación:** Este archivo

---

**Última actualización:** 17 de Octubre 2025
