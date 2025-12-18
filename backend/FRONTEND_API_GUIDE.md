# 📘 Guía Completa de API para Frontend

## 📋 RESUMEN COMPLETO DEL SISTEMA NUEVO

### 🎯 Cambio Principal

**ANTES**: Cada atleta tenía un solo campo `activityType: string` (ej: "CrossFit", "Open Box")

**AHORA**: Sistema multi-actividad donde:

- Hay una tabla `Activity` con todas las actividades disponibles del box
- Cada atleta puede tener **múltiples actividades simultáneas** a través de `AthleteActivity`
- Los pagos se asocian a actividades específicas
- Los entrenamientos (ex-WODs) se asocian a actividades específicas

---

## 🗄️ MODELOS DE BASE DE DATOS

### 1. Activity (Nueva tabla - Catálogo de actividades)

```typescript
{
  id: string; // "cm123abc..."
  name: string; // "CrossFit", "Open Box", "Funcional", etc. (ÚNICO)
  description: string; // "Entrenamiento de alta intensidad..."
  price: number; // 25000 (pesos, no centavos)
  color: string; // "#FF5733" (para UI)
  icon: string; // "🏋️" o "dumbbell" (para UI)
  active: boolean; // true/false
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

**Relaciones:**

- `athleteActivities`: AthleteActivity[] - Atletas que tienen esta actividad
- `payments`: Payment[] - Pagos asociados a esta actividad
- `trainings`: Training[] - Entrenamientos de esta actividad

---

### 2. AthleteActivity (Relación atleta-actividad)

```typescript
{
  id: string
  athleteId: string      // FK a AthleteProfile
  activityId: string     // FK a Activity
  startDate: DateTime    // Cuándo empezó esta actividad
  endDate?: DateTime     // null = activa, con fecha = finalizada
  isActive: boolean      // true/false
  notes?: string         // "Entrenamiento personalizado"
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Relaciones:**

- `athlete`: AthleteProfile
- `activity`: Activity

---

### 3. Payment (Actualizado)

```typescript
{
  id: string
  athleteId: string
  activityId?: string    // NUEVO: Qué actividad está pagando
  amount: number         // ARREGLADO: Ahora guarda pesos directamente (15000, no 1500000)
  periodStart: DateTime
  periodEnd: DateTime
  status: "PENDING" | "APPROVED" | "REJECTED"
  evidenceUrl?: string
  evidenceText?: string
  createdAt: DateTime
  approvedAt?: DateTime
}
```

**Relaciones:**

- `athlete`: AthleteProfile
- `activity`: Activity

**⚠️ IMPORTANTE:** El campo `amount` ahora guarda pesos directamente. NO multiplicar por 100.

---

### 4. Training (Renombrado de WOD)

```typescript
{
  id: string
  title: string          // "Entrenamiento de Fuerza"
  description: string    // Descripción del workout
  date: DateTime
  track?: string         // Música
  videoUrl?: string      // NUEVO: URL de YouTube/Vimeo
  activityId?: string    // NUEVO: A qué actividad pertenece
  createdById: string
}
```

**Relaciones:**

- `activity`: Activity
- `createdBy`: User
- `assignments`: TrainingAssignment[]

**⚠️ IMPORTANTE:** Todas las rutas `/wods/*` ahora son `/trainings/*`

---

## 🔌 ENDPOINTS PARA EL FRONTEND

### 📦 ACTIVIDADES (Módulo nuevo)

#### 1. Listar todas las actividades

```http
GET /activities
GET /activities?includeInactive=true
```

**Acceso:** Público (autenticado)

**Query params:**

- `includeInactive` (boolean, opcional): Incluir actividades desactivadas

**Respuesta:**

```json
[
  {
    "id": "cm123abc",
    "name": "CrossFit",
    "description": "Entrenamiento funcional de alta intensidad",
    "price": 25000,
    "color": "#FF5733",
    "icon": "🏋️",
    "active": true,
    "createdAt": "2025-10-30T10:00:00Z",
    "updatedAt": "2025-10-30T10:00:00Z",
    "_count": {
      "athleteActivities": 15
    }
  },
  {
    "id": "cm456def",
    "name": "Open Box",
    "description": "Entrenamiento libre",
    "price": 18000,
    "color": "#4CAF50",
    "icon": "💪",
    "active": true,
    "_count": {
      "athleteActivities": 8
    }
  }
]
```

---

#### 2. Ver una actividad específica

```http
GET /activities/:id
```

**Acceso:** Público (autenticado)

**Respuesta:**

```json
{
  "id": "cm123abc",
  "name": "CrossFit",
  "description": "Entrenamiento funcional de alta intensidad",
  "price": 25000,
  "color": "#FF5733",
  "icon": "🏋️",
  "active": true,
  "athleteActivities": [
    {
      "id": "aa123",
      "athleteId": "athlete1",
      "startDate": "2025-01-01T00:00:00Z",
      "isActive": true,
      "athlete": {
        "id": "athlete1",
        "fullName": "Juan Pérez",
        "user": {
          "email": "juan@example.com"
        }
      }
    }
  ]
}
```

---

#### 3. Crear nueva actividad

```http
POST /activities
Authorization: Bearer <token>
Content-Type: application/json
```

**Acceso:** Solo ADMIN

**Body:**

```json
{
  "name": "Musculación",
  "description": "Entrenamiento de fuerza con pesas",
  "price": 19000,
  "color": "#9C27B0",
  "icon": "💪"
}
```

**Validaciones:**

- `name`: Requerido, único
- `price`: Opcional, debe ser número positivo
- `color`: Opcional, formato hex (#RRGGBB)

**Respuesta:**

```json
{
  "id": "cm789xyz",
  "name": "Musculación",
  "description": "Entrenamiento de fuerza con pesas",
  "price": 19000,
  "color": "#9C27B0",
  "icon": "💪",
  "active": true,
  "createdAt": "2025-10-30T12:00:00Z",
  "updatedAt": "2025-10-30T12:00:00Z"
}
```

**Errores:**

- 409: Ya existe una actividad con ese nombre
- 401: No autenticado
- 403: No es admin

---

#### 4. Actualizar actividad

```http
PUT /activities/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Acceso:** Solo ADMIN

**Body (todos los campos opcionales):**

```json
{
  "name": "CrossFit Elite",
  "description": "Nueva descripción",
  "price": 22000,
  "color": "#FF6B6B",
  "icon": "🔥"
}
```

**Respuesta:**

```json
{
  "id": "cm123abc",
  "name": "CrossFit Elite",
  "description": "Nueva descripción",
  "price": 22000,
  "color": "#FF6B6B",
  "icon": "🔥",
  "active": true,
  "updatedAt": "2025-10-30T13:00:00Z"
}
```

**Errores:**

- 404: Actividad no encontrada
- 409: Ya existe otra actividad con ese nombre

---

#### 5. Desactivar actividad

```http
DELETE /activities/:id
Authorization: Bearer <token>
```

**Acceso:** Solo ADMIN

**Nota:** No borra la actividad, solo pone `active: false`

**Respuesta:**

```json
{
  "id": "cm123abc",
  "name": "CrossFit",
  "active": false,
  "updatedAt": "2025-10-30T14:00:00Z"
}
```

---

### 👤 ASIGNACIÓN DE ACTIVIDADES A ATLETAS

#### 6. Ver actividades de un atleta

```http
GET /athletes/:athleteId/activities
GET /athletes/:athleteId/activities?onlyActive=true
```

**Acceso:** ADMIN o el mismo ATHLETE

**Query params:**

- `onlyActive` (boolean, opcional): Solo actividades activas (default: false)

**Respuesta:**

```json
[
  {
    "id": "aa123",
    "athleteId": "athlete1",
    "activityId": "cm123abc",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": null,
    "isActive": true,
    "notes": "Comenzó en enero",
    "createdAt": "2025-01-01T00:00:00Z",
    "activity": {
      "id": "cm123abc",
      "name": "CrossFit",
      "description": "Entrenamiento funcional de alta intensidad",
      "price": 25000,
      "color": "#FF5733",
      "icon": "🏋️",
      "active": true
    }
  },
  {
    "id": "aa456",
    "athleteId": "athlete1",
    "activityId": "cm456def",
    "startDate": "2025-03-15T00:00:00Z",
    "endDate": null,
    "isActive": true,
    "notes": "También hace open box",
    "activity": {
      "id": "cm456def",
      "name": "Open Box",
      "price": 18000,
      "color": "#4CAF50",
      "icon": "💪"
    }
  }
]
```

---

#### 7. Asignar actividad a un atleta

```http
POST /activities/assign
Authorization: Bearer <token>
Content-Type: application/json
```

**Acceso:** Solo ADMIN

**Body:**

```json
{
  "athleteId": "athlete123",
  "activityId": "cm123abc",
  "startDate": "2025-10-30",
  "notes": "Comenzó en nivel principiante"
}
```

**Campos:**

- `athleteId`: Requerido
- `activityId`: Requerido
- `startDate`: Opcional (default: hoy)
- `notes`: Opcional

**Respuesta:**

```json
{
  "id": "aa789",
  "athleteId": "athlete123",
  "activityId": "cm123abc",
  "startDate": "2025-10-30T00:00:00Z",
  "endDate": null,
  "isActive": true,
  "notes": "Comenzó en nivel principiante",
  "createdAt": "2025-10-30T15:00:00Z",
  "activity": {
    "id": "cm123abc",
    "name": "CrossFit",
    "description": "Entrenamiento funcional de alta intensidad",
    "price": 25000,
    "color": "#FF5733",
    "icon": "🏋️",
    "active": true
  }
}
```

**Errores:**

- 404: Atleta o actividad no encontrados
- 409: El atleta ya tiene esta actividad asignada y activa

---

#### 8. Finalizar actividad de un atleta

```http
DELETE /activities/assignments/:athleteActivityId
Authorization: Bearer <token>
```

**Acceso:** Solo ADMIN

**Nota:** No borra el registro, pone `isActive: false` y `endDate: now()`

**Respuesta:**

```json
{
  "id": "aa789",
  "athleteId": "athlete123",
  "activityId": "cm123abc",
  "startDate": "2025-10-30T00:00:00Z",
  "endDate": "2025-10-30T16:00:00Z",
  "isActive": false,
  "notes": "Comenzó en nivel principiante"
}
```

---

### 🏋️ ENTRENAMIENTOS (Renombrado de WODs)

**⚠️ IMPORTANTE:** Todas las rutas `/wods/*` ahora son `/trainings/*`

#### 9. Crear entrenamiento

```http
POST /trainings
Authorization: Bearer <token>
Content-Type: application/json
```

**Acceso:** Solo ADMIN

**Body:**

```json
{
  "title": "Fuerza - Día 1",
  "description": "5x5 Back Squat\n3x10 Pull-ups\n3x15 Push-ups",
  "date": "2025-10-31",
  "activityId": "cm123abc",
  "videoUrl": "https://youtube.com/watch?v=abc123",
  "track": "Rock Playlist"
}
```

**Campos:**

- `title`: Requerido
- `description`: Requerido
- `date`: Requerido (ISO 8601 o YYYY-MM-DD)
- `activityId`: Opcional (asociar a actividad específica)
- `videoUrl`: Opcional (URL de YouTube/Vimeo)
- `track`: Opcional (playlist de música)

**Respuesta:**

```json
{
  "id": "t123",
  "title": "Fuerza - Día 1",
  "description": "5x5 Back Squat\n3x10 Pull-ups\n3x15 Push-ups",
  "date": "2025-10-31T00:00:00Z",
  "activityId": "cm123abc",
  "videoUrl": "https://youtube.com/watch?v=abc123",
  "track": "Rock Playlist",
  "createdById": "coach123",
  "createdAt": "2025-10-30T17:00:00Z"
}
```

---

#### 10. Crear entrenamientos en bulk

```http
POST /trainings/bulk
Authorization: Bearer <token>
Content-Type: application/json
```

**Acceso:** Solo ADMIN

**Body:**

```json
{
  "trainings": [
    {
      "title": "CrossFit - Día 1",
      "description": "AMRAP 20min:\n10 Pull-ups\n15 Push-ups\n20 Air Squats",
      "date": "2025-11-01",
      "activityId": "cm123abc"
    },
    {
      "title": "Open Box - Libre",
      "description": "Entrenamiento libre",
      "date": "2025-11-01",
      "activityId": "cm456def"
    }
  ],
  "skipDuplicates": true
}
```

**Campos:**

- `trainings`: Array de entrenamientos (mismos campos que crear uno)
- `skipDuplicates`: Opcional (default: false) - Si true, no falla si ya existe

**Respuesta:**

```json
{
  "count": 2
}
```

---

#### 11. Ver entrenamientos de hoy

```http
GET /trainings/today
GET /trainings/today?activityId=cm123abc
```

**Acceso:** Público (autenticado)

**Query params:**

- `activityId` (string, opcional): Filtrar por actividad específica

**Respuesta:**

```json
[
  {
    "id": "t123",
    "title": "CrossFit - Fuerza",
    "description": "5x5 Back Squat\n3x10 Pull-ups",
    "date": "2025-10-30T00:00:00Z",
    "videoUrl": "https://youtube.com/watch?v=abc123",
    "track": "Rock Playlist",
    "activityId": "cm123abc",
    "activity": {
      "id": "cm123abc",
      "name": "CrossFit",
      "color": "#FF5733",
      "icon": "🏋️"
    },
    "createdBy": {
      "id": "coach1",
      "email": "coach@example.com",
      "role": "ADMIN"
    }
  },
  {
    "id": "t456",
    "title": "Open Box - Libre",
    "description": "Entrenamiento libre",
    "date": "2025-10-30T00:00:00Z",
    "activityId": "cm456def",
    "activity": {
      "id": "cm456def",
      "name": "Open Box",
      "color": "#4CAF50",
      "icon": "💪"
    }
  }
]
```

---

#### 12. Ver entrenamientos por fecha específica

```http
GET /trainings/date?date=2025-11-01
GET /trainings/date?date=2025-11-01&activityId=cm123abc
```

**Acceso:** Público (autenticado)

**Query params:**

- `date`: Requerido (formato: YYYY-MM-DD)
- `activityId`: Opcional

**Respuesta:** Mismo formato que `/trainings/today`

---

#### 13. Ver entrenamientos del mes (calendario)

```http
GET /trainings/month?year=2025&month=11
GET /trainings/month?year=2025&month=11&activityId=cm123abc
```

**Acceso:** Público (autenticado)

**Query params:**

- `year`: Requerido (número)
- `month`: Requerido (1-12)
- `activityId`: Opcional

**Respuesta:**

```json
[
  {
    "id": "t123",
    "title": "CrossFit - Día 1",
    "date": "2025-11-01T00:00:00Z",
    "activityId": "cm123abc",
    "activity": { "name": "CrossFit", "color": "#FF5733" }
  },
  {
    "id": "t124",
    "title": "CrossFit - Día 2",
    "date": "2025-11-02T00:00:00Z",
    "activityId": "cm123abc",
    "activity": { "name": "CrossFit", "color": "#FF5733" }
  }
]
```

---

#### 14. Ver entrenamientos por rango de fechas

```http
GET /trainings/range?start=2025-11-01&end=2025-11-30
GET /trainings/range?start=2025-11-01&end=2025-11-30&activityId=cm123abc
```

**Acceso:** Público (autenticado)

**Query params:**

- `start`: Requerido (formato: YYYY-MM-DD)
- `end`: Requerido (formato: YYYY-MM-DD)
- `activityId`: Opcional

**Respuesta:** Mismo formato que `/trainings/month`

---

#### 15. Historial de entrenamientos pasados

```http
GET /trainings/history/past?limit=20
GET /trainings/history/past?limit=20&activityId=cm123abc
```

**Acceso:** Público (autenticado)

**Query params:**

- `limit`: Opcional (default: 10)
- `activityId`: Opcional

**Respuesta:** Array de entrenamientos ordenados por fecha descendente

---

#### 16. Próximos entrenamientos

```http
GET /trainings/upcoming/future?limit=20
GET /trainings/upcoming/future?limit=20&activityId=cm123abc
```

**Acceso:** Público (autenticado)

**Query params:**

- `limit`: Opcional (default: 10)
- `activityId`: Opcional

**Respuesta:** Array de entrenamientos ordenados por fecha ascendente

---

#### 17. Ver un entrenamiento específico

```http
GET /trainings/:id
```

**Acceso:** Público (autenticado)

**Respuesta:**

```json
{
  "id": "t123",
  "title": "CrossFit - Fuerza",
  "description": "5x5 Back Squat\n3x10 Pull-ups",
  "date": "2025-10-30T00:00:00Z",
  "videoUrl": "https://youtube.com/watch?v=abc123",
  "track": "Rock Playlist",
  "activityId": "cm123abc",
  "activity": {
    "id": "cm123abc",
    "name": "CrossFit",
    "description": "Entrenamiento funcional de alta intensidad",
    "color": "#FF5733",
    "icon": "🏋️"
  },
  "createdBy": {
    "id": "coach1",
    "email": "coach@example.com"
  }
}
```

---

#### 18. Actualizar entrenamiento

```http
PUT /trainings/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Acceso:** Solo ADMIN

**Body (todos los campos opcionales):**

```json
{
  "title": "CrossFit - Fuerza Modificado",
  "description": "Nueva descripción",
  "date": "2025-11-01",
  "activityId": "cm123abc",
  "videoUrl": "https://youtube.com/watch?v=xyz789",
  "track": "Nueva playlist"
}
```

---

#### 19. Eliminar entrenamiento

```http
DELETE /trainings/:id
Authorization: Bearer <token>
```

**Acceso:** Solo ADMIN

**Respuesta:** 204 No Content

---

#### 20. Listar todos los entrenamientos (paginado)

```http
GET /trainings?page=1&limit=20
GET /trainings?page=1&limit=20&activityId=cm123abc
```

**Acceso:** Solo ADMIN

**Query params:**

- `page`: Opcional (default: 1)
- `limit`: Opcional (default: 20)
- `activityId`: Opcional

**Respuesta:**

```json
{
  "trainings": [
    /* array de entrenamientos */
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

---

### 💰 PAGOS (Actualizado)

#### 21. Crear pago

```http
POST /payments
Authorization: Bearer <token>
Content-Type: application/json
```

**Acceso:** ADMIN o el mismo ATHLETE

**Body:**

```json
{
  "athleteId": "athlete123",
  "activityId": "cm123abc",
  "amount": 25000,
  "periodStart": "2025-11-01",
  "periodEnd": "2025-11-30",
  "evidenceUrl": "https://storage.example.com/receipt.jpg",
  "evidenceText": "Transferencia #12345"
}
```

**Campos:**

- `athleteId`: Requerido
- `activityId`: Opcional (qué actividad está pagando)
- `amount`: Requerido - **ENVIAR PESOS DIRECTOS** (15000, no 1500000)
- `periodStart`: Requerido (ISO 8601 o YYYY-MM-DD)
- `periodEnd`: Requerido (ISO 8601 o YYYY-MM-DD)
- `evidenceUrl`: Opcional (URL de la imagen del comprobante)
- `evidenceText`: Opcional (número de transferencia, notas)

**⚠️ IMPORTANTE:** El campo `amount` ya NO se multiplica por 100. Enviar el valor en pesos directamente.

**Respuesta:**

```json
{
  "id": "pay123",
  "athleteId": "athlete123",
  "activityId": "cm123abc",
  "amount": 25000,
  "periodStart": "2025-11-01T00:00:00Z",
  "periodEnd": "2025-11-30T23:59:59Z",
  "status": "PENDING",
  "evidenceUrl": "https://storage.example.com/receipt.jpg",
  "evidenceText": "Transferencia #12345",
  "createdAt": "2025-10-30T18:00:00Z",
  "approvedAt": null,
  "activity": {
    "id": "cm123abc",
    "name": "CrossFit",
    "price": 25000,
    "color": "#FF5733"
  },
  "athlete": {
    "id": "athlete123",
    "fullName": "Juan Pérez",
    "user": {
      "email": "juan@example.com"
    }
  }
}
```

---

#### 22. Ver pagos de un atleta

```http
GET /payments/athlete/:athleteId
GET /payments/athlete/:athleteId?status=PENDING
```

**Acceso:** ADMIN o el mismo ATHLETE

**Query params:**

- `status`: Opcional (PENDING, APPROVED, REJECTED)

**Respuesta:** Array de pagos del atleta

---

#### 23. Aprobar pago

```http
PATCH /payments/:id/approve
Authorization: Bearer <token>
```

**Acceso:** Solo ADMIN

**Respuesta:**

```json
{
  "id": "pay123",
  "status": "APPROVED",
  "approvedAt": "2025-10-30T19:00:00Z"
}
```

---

#### 24. Rechazar pago

```http
PATCH /payments/:id/reject
Authorization: Bearer <token>
```

**Acceso:** Solo ADMIN

**Respuesta:**

```json
{
  "id": "pay123",
  "status": "REJECTED"
}
```

---

## 🎨 EJEMPLOS DE FLUJOS COMPLETOS

### Flujo 1: Setup inicial del box (Admin)

```typescript
// 1. Crear actividades del box
const crossfit = await fetch('/activities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    name: 'CrossFit',
    description: 'Entrenamiento funcional de alta intensidad',
    price: 25000,
    color: '#FF5733',
    icon: '🏋️',
  }),
});

const openBox = await fetch('/activities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    name: 'Open Box',
    description: 'Entrenamiento libre',
    price: 18000,
    color: '#4CAF50',
    icon: '💪',
  }),
});

// 2. Asignar actividades a atletas
await fetch('/activities/assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    athleteId: 'athlete123',
    activityId: crossfit.id,
    notes: 'Comenzó en octubre',
  }),
});

// 3. Crear entrenamientos para la semana
await fetch('/trainings/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    trainings: [
      {
        title: 'CrossFit - Lunes',
        description: '5x5 Back Squat\nAMRAP 10min: 10 Pull-ups, 15 Push-ups',
        date: '2025-11-03',
        activityId: crossfit.id,
        videoUrl: 'https://youtube.com/watch?v=abc123',
      },
      {
        title: 'Open Box - Lunes',
        description: 'Entrenamiento libre',
        date: '2025-11-03',
        activityId: openBox.id,
      },
      {
        title: 'CrossFit - Martes',
        description: '3x10 Deadlift\nFor Time: 21-15-9 Thrusters & Pull-ups',
        date: '2025-11-04',
        activityId: crossfit.id,
      },
    ],
    skipDuplicates: true,
  }),
});
```

---

### Flujo 2: Atleta ve sus entrenamientos del día

```typescript
// 1. Obtener actividades del atleta logueado
const athleteId = currentUser.athlete.id;
const myActivities = await fetch(
  `/athletes/${athleteId}/activities?onlyActive=true`,
  {
    headers: { Authorization: `Bearer ${userToken}` },
  },
);
// Respuesta: [{ activityId: "crossfit-id", activity: {...} }, { activityId: "openbox-id", activity: {...} }]

// 2. Ver entrenamientos de hoy
const todayTrainings = await fetch('/trainings/today', {
  headers: { Authorization: `Bearer ${userToken}` },
});

// 3. Filtrar solo los entrenamientos de mis actividades
const myActivityIds = myActivities.map((a) => a.activityId);
const myTodayTrainings = todayTrainings.filter(
  (t) => !t.activityId || myActivityIds.includes(t.activityId),
);

// Mostrar en la UI
myTodayTrainings.forEach((training) => {
  console.log(`${training.activity?.name || 'General'}: ${training.title}`);
  console.log(training.description);
  if (training.videoUrl) {
    console.log(`Video: ${training.videoUrl}`);
  }
});
```

---

### Flujo 3: Atleta registra un pago

```typescript
// 1. Ver mis actividades activas
const myActivities = await fetch(
  `/athletes/${athleteId}/activities?onlyActive=true`,
  {
    headers: { Authorization: `Bearer ${userToken}` },
  },
);

// 2. Mostrar selector: "¿Qué actividad estás pagando?"
// Usuario selecciona: CrossFit

// 3. Subir comprobante (opcional)
const formData = new FormData();
formData.append('file', receiptImage);
const uploadResponse = await fetch('/media/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${userToken}` },
  body: formData,
});
const evidenceUrl = uploadResponse.url;

// 4. Crear pago
const payment = await fetch('/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${userToken}`,
  },
  body: JSON.stringify({
    athleteId: athleteId,
    activityId: myActivities[0].activityId, // CrossFit seleccionado
    amount: 25000, // ⚠️ IMPORTANTE: Enviar pesos directos
    periodStart: '2025-11-01',
    periodEnd: '2025-11-30',
    evidenceUrl: evidenceUrl,
    evidenceText: 'Transferencia Mercado Pago #987654',
  }),
});

// 5. Mostrar confirmación
console.log(`Pago registrado: $${payment.amount}`);
console.log(`Estado: ${payment.status}`); // "PENDING"
```

---

### Flujo 4: Admin aprueba/rechaza pagos

```typescript
// 1. Ver pagos pendientes
const pendingPayments = await fetch('/payments?status=PENDING', {
  headers: { Authorization: `Bearer ${adminToken}` },
});

// 2. Mostrar lista de pagos pendientes
pendingPayments.forEach((payment) => {
  console.log(`${payment.athlete.fullName} - $${payment.amount}`);
  console.log(`Actividad: ${payment.activity?.name || 'No especificada'}`);
  console.log(`Período: ${payment.periodStart} al ${payment.periodEnd}`);
  if (payment.evidenceUrl) {
    console.log(`Comprobante: ${payment.evidenceUrl}`);
  }
});

// 3. Aprobar pago
await fetch(`/payments/${payment.id}/approve`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${adminToken}` },
});

// O rechazar
await fetch(`/payments/${payment.id}/reject`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${adminToken}` },
});
```

---

### Flujo 5: Calendario de entrenamientos mensual

```typescript
// 1. Obtener entrenamientos del mes
const year = 2025;
const month = 11; // Noviembre
const monthTrainings = await fetch(
  `/trainings/month?year=${year}&month=${month}`,
  {
    headers: { Authorization: `Bearer ${userToken}` },
  },
);

// 2. Agrupar por día para calendario
const calendar = {};
monthTrainings.forEach((training) => {
  const day = new Date(training.date).getDate();
  if (!calendar[day]) {
    calendar[day] = [];
  }
  calendar[day].push({
    title: training.title,
    activity: training.activity?.name,
    color: training.activity?.color,
    icon: training.activity?.icon,
  });
});

// 3. Renderizar calendario
Object.entries(calendar).forEach(([day, trainings]) => {
  console.log(`Día ${day}:`);
  trainings.forEach((t) => {
    console.log(`  ${t.icon} ${t.activity}: ${t.title}`);
  });
});
```

---

### Flujo 6: Atleta tiene múltiples actividades

```typescript
// Ejemplo: Juan hace CrossFit de lunes a viernes, y Open Box los sábados

// 1. Admin asigna ambas actividades
await fetch('/activities/assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    athleteId: 'juan123',
    activityId: 'crossfit-id',
    notes: 'L-V 7am',
  }),
});

await fetch('/activities/assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    athleteId: 'juan123',
    activityId: 'openbox-id',
    notes: 'Sábados 9am',
  }),
});

// 2. Juan ve sus actividades
const juanActivities = await fetch(
  '/athletes/juan123/activities?onlyActive=true',
);
// Respuesta: [CrossFit, Open Box]

// 3. Juan paga CrossFit este mes
await fetch('/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${juanToken}`,
  },
  body: JSON.stringify({
    athleteId: 'juan123',
    activityId: 'crossfit-id',
    amount: 25000,
    periodStart: '2025-11-01',
    periodEnd: '2025-11-30',
  }),
});

// 4. Juan paga Open Box por separado
await fetch('/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${juanToken}`,
  },
  body: JSON.stringify({
    athleteId: 'juan123',
    activityId: 'openbox-id',
    amount: 18000,
    periodStart: '2025-11-01',
    periodEnd: '2025-11-30',
  }),
});

// 5. Ver entrenamientos de hoy (muestra ambos)
const todayTrainings = await fetch('/trainings/today');
// Respuesta: [CrossFit training, Open Box training]

// 6. Filtrar solo CrossFit
const crossfitTrainings = await fetch(
  '/trainings/today?activityId=crossfit-id',
);
```

---

## 📝 NOTAS IMPORTANTES

### ⚠️ Cambios Críticos que DEBES hacer en el Frontend

1. **Pagos - NO multiplicar por 100**

   ```typescript
   // ❌ ANTES (INCORRECTO)
   const amount = userInput * 100; // 15000 → 1500000

   // ✅ AHORA (CORRECTO)
   const amount = userInput; // 15000 → 15000
   ```

2. **Rutas WOD → Training**

   ```typescript
   // ❌ ANTES
   fetch('/wods/today');
   fetch('/wods/:id');

   // ✅ AHORA
   fetch('/trainings/today');
   fetch('/trainings/:id');
   ```

3. **Multi-actividad**

   ```typescript
   // ❌ ANTES (un solo string)
   athlete.activityType; // "CrossFit"

   // ✅ AHORA (array de actividades)
   athlete.activities; // [{ activity: { name: "CrossFit" } }, { activity: { name: "Open Box" } }]
   ```

---

### 🔐 Autenticación

Todos los endpoints requieren autenticación mediante JWT en cookie HttpOnly o header:

```typescript
// Opción 1: Cookie HttpOnly (automática después de login)
// La cookie se envía automáticamente en cada request

// Opción 2: Header Authorization
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

### 🎯 Roles y Permisos

- **ADMIN**: Acceso completo (crear actividades, asignar, aprobar pagos, crear entrenamientos)
- **COACH**: Similar a ADMIN (dependiendo de implementación)
- **ATHLETE**:
  - Ver actividades (todas)
  - Ver sus propias actividades asignadas
  - Ver entrenamientos (todos o filtrados)
  - Crear sus propios pagos
  - Ver sus propios pagos

---

### 🔄 Migración desde sistema anterior

Si tienes datos anteriores con `activityType` string:

1. Crear las actividades en el catálogo (`Activity`)
2. Migrar cada atleta:

   ```typescript
   // Leer activityType viejo
   const oldActivityType = athlete.activityType; // "CrossFit"

   // Buscar actividad correspondiente
   const activities = await fetch('/activities');
   const activity = activities.find((a) => a.name === oldActivityType);

   // Asignar actividad al atleta
   await fetch('/activities/assign', {
     method: 'POST',
     body: JSON.stringify({
       athleteId: athlete.id,
       activityId: activity.id,
     }),
   });
   ```

---

### 📊 Estados de Pago

```typescript
enum PaymentStatus {
  PENDING = 'PENDING', // Pendiente de aprobación
  APPROVED = 'APPROVED', // Aprobado por admin
  REJECTED = 'REJECTED', // Rechazado por admin
}
```

---

### 🎨 Sugerencias de UI

**Colores de actividades:**

- CrossFit: `#FF5733` (rojo/naranja)
- Open Box: `#4CAF50` (verde)
- Funcional: `#2196F3` (azul)
- 28T: `#FF9800` (naranja)
- Musculación: `#9C27B0` (púrpura)

**Iconos sugeridos:**

- CrossFit: 🏋️ o ⚡
- Open Box: 💪 o 🔓
- Funcional: 🤸 or 🏃
- 28T: 🔥 or ⏱️
- Musculación: 💪 or 🏋️‍♂️

---

## 🚀 Endpoints del Seed

Si corres el seed script (`npx prisma db seed`), se crearán estas 5 actividades por defecto:

1. **CrossFit** - $25,000 - #FF5733 - 🏋️
2. **Open Box** - $18,000 - #4CAF50 - 💪
3. **Funcional** - $20,000 - #2196F3 - 🤸
4. **28T** - $22,000 - #FF9800 - ⏱️
5. **Musculación** - $19,000 - #9C27B0 - 💪

---

## 📞 Testing de Endpoints

Puedes probar los endpoints con curl:

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Listar actividades
curl http://localhost:3000/activities \
  -H "Authorization: Bearer YOUR_TOKEN"

# Crear actividad
curl -X POST http://localhost:3000/activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Yoga","price":15000,"color":"#E91E63","icon":"🧘"}'

# Ver entrenamientos de hoy
curl http://localhost:3000/trainings/today \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filtrar por actividad
curl "http://localhost:3000/trainings/today?activityId=ACTIVITY_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ❓ FAQ

**P: ¿Puedo asignar la misma actividad dos veces a un atleta?**
R: No, el sistema evita duplicados. Si intentas asignar una actividad que el atleta ya tiene activa, recibirás un error 409.

**P: ¿Cómo elimino una actividad de un atleta?**
R: Usa `DELETE /activities/assignments/:athleteActivityId`. Esto NO borra el registro, solo lo desactiva.

**P: ¿Puedo crear un entrenamiento sin actividad?**
R: Sí, el campo `activityId` es opcional. Entrenamientos sin actividad son "generales".

**P: ¿Los atletas ven todos los entrenamientos o solo los de sus actividades?**
R: Por defecto ven todos. Debes filtrar en el frontend usando `?activityId=xxx` o filtrando el array de respuesta.

**P: ¿Cómo sé qué actividades tiene un atleta?**
R: `GET /athletes/:athleteId/activities?onlyActive=true`

**P: ¿Puedo pagar sin especificar actividad?**
R: Sí, `activityId` es opcional en pagos. Útil para pagos generales o múltiples actividades.

**P: ¿Los precios en Activity son obligatorios?**
R: No, son sugeridos. El precio real se define al crear cada pago.

---

## 📚 Documentación Adicional

- **Schema Prisma completo:** `/prisma/schema.prisma`
- **Sistema de actividades completo:** `/ACTIVITIES_SYSTEM_COMPLETE.md`
- **Guía de migración:** `/ACTIVITIES_MIGRATION_GUIDE.md`
- **Tipos TypeScript:** `/API_TYPES.ts`

---

**Última actualización:** 30 de Octubre, 2025
**Versión API:** 2.0.0 (Multi-Activity System)
