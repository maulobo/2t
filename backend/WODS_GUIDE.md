# Guía de Gestión de WODs

## 🎯 Descripción

Sistema completo para que el ADMIN/COACH pueda cargar WODs con fechas específicas y los atletas puedan ver los WODs del día, histórico y calendario.

## 🔐 Permisos

- **ADMIN/COACH**: Pueden crear, editar y eliminar WODs
- **ATHLETE**: Solo pueden ver WODs

---

## 📝 Endpoints para ADMIN/COACH

### 1. Crear un WOD

```http
POST /wods
Authorization: Cookie (access_token)
Content-Type: application/json

{
  "title": "Fran",
  "description": "21-15-9\nThrusters (95/65 lb)\nPull-ups",
  "date": "2025-10-28",
  "track": "RX",
  "createdById": "clxxx..." // ID del admin/coach
}
```

**Respuesta**:

```json
{
  "id": "clxxx...",
  "title": "Fran",
  "description": "21-15-9\nThrusters (95/65 lb)\nPull-ups",
  "date": "2025-10-28T00:00:00.000Z",
  "track": "RX",
  "createdById": "clxxx...",
  "createdBy": {
    "id": "clxxx...",
    "email": "admin@empresa.com.ar",
    "role": "ADMIN"
  }
}
```

---

### 2. Crear múltiples WODs (Carga masiva del mes)

```http
POST /wods/bulk
Authorization: Cookie (access_token)
Content-Type: application/json

{
  "createdById": "clxxx...",
  "wods": [
    {
      "title": "Lunes - Cindy",
      "description": "20 min AMRAP:\n5 Pull-ups\n10 Push-ups\n15 Air Squats",
      "date": "2025-11-04",
      "track": "RX"
    },
    {
      "title": "Martes - Fran",
      "description": "21-15-9\nThrusters\nPull-ups",
      "date": "2025-11-05",
      "track": "RX"
    },
    {
      "title": "Miércoles - Helen",
      "description": "3 rounds for time:\n400m Run\n21 KBS (53/35)\n12 Pull-ups",
      "date": "2025-11-06",
      "track": "RX"
    },
    {
      "title": "Jueves - Grace",
      "description": "30 Clean & Jerk (135/95) for time",
      "date": "2025-11-07",
      "track": "RX"
    },
    {
      "title": "Viernes - Murph",
      "description": "1 mile Run\n100 Pull-ups\n200 Push-ups\n300 Air Squats\n1 mile Run",
      "date": "2025-11-08",
      "track": "RX"
    }
  ]
}
```

**Respuesta**:

```json
{
  "message": "5 WODs creados exitosamente",
  "count": 5
}
```

---

### 3. Actualizar un WOD

```http
PUT /wods/:id
Authorization: Cookie (access_token)
Content-Type: application/json

{
  "title": "Fran Modificado",
  "description": "21-15-9\nThrusters (105/75 lb)\nChest to Bar Pull-ups",
  "track": "RX+"
}
```

---

### 4. Eliminar un WOD

```http
DELETE /wods/:id
Authorization: Cookie (access_token)
```

**Respuesta**:

```json
{
  "message": "WOD eliminado correctamente",
  "id": "clxxx..."
}
```

---

## 👁️ Endpoints para VER WODs (Todos los usuarios autenticados)

### 1. Ver WOD de HOY

```http
GET /wods/today
Authorization: Cookie (access_token)
```

**Respuesta**:

```json
{
  "date": "2025-10-27",
  "wods": [
    {
      "id": "clxxx...",
      "title": "Fran",
      "description": "21-15-9\nThrusters (95/65 lb)\nPull-ups",
      "date": "2025-10-27T00:00:00.000Z",
      "track": "RX",
      "createdBy": {
        "id": "clxxx...",
        "email": "admin@empresa.com.ar",
        "role": "ADMIN"
      },
      "assignments": []
    }
  ]
}
```

Si no hay WODs:

```json
{
  "message": "No hay WODs programados para hoy",
  "date": "2025-10-27",
  "wods": []
}
```

---

### 2. Ver WOD de una fecha específica

```http
GET /wods/date?date=2025-10-28
Authorization: Cookie (access_token)
```

---

### 3. Ver WODs del mes completo (Calendario)

```http
GET /wods/month?year=2025&month=11
Authorization: Cookie (access_token)
```

**Respuesta**:

```json
{
  "year": 2025,
  "month": 11,
  "totalWODs": 23,
  "wods": [
    {
      "id": "clxxx...",
      "title": "Lunes - Cindy",
      "date": "2025-11-04T00:00:00.000Z",
      ...
    },
    // ... todos los WODs del mes
  ]
}
```

---

### 4. Ver WODs de un rango de fechas

```http
GET /wods/range?startDate=2025-11-01&endDate=2025-11-07
Authorization: Cookie (access_token)
```

**Respuesta**:

```json
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-07",
  "totalWODs": 5,
  "wods": [...]
}
```

---

### 5. Ver histórico de WODs (pasados)

```http
GET /wods/history/past?limit=20
Authorization: Cookie (access_token)
```

**Respuesta**:

```json
{
  "message": "WODs históricos",
  "totalWODs": 20,
  "wods": [
    // WODs ordenados del más reciente al más antiguo
  ]
}
```

---

### 6. Ver WODs próximos (futuros)

```http
GET /wods/upcoming/future?limit=10
Authorization: Cookie (access_token)
```

**Respuesta**:

```json
{
  "message": "WODs próximos",
  "totalWODs": 10,
  "wods": [
    // WODs ordenados desde hoy en adelante
  ]
}
```

---

### 7. Ver todos los WODs (paginado)

```http
GET /wods?page=1&limit=30
Authorization: Cookie (access_token)
```

**Respuesta**:

```json
{
  "wods": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 30,
    "totalPages": 5
  }
}
```

---

### 8. Ver un WOD específico

```http
GET /wods/:id
Authorization: Cookie (access_token)
```

---

## 💻 Ejemplos desde el Frontend

### Crear un WOD (Admin)

```typescript
const createWOD = async (wodData, adminId) => {
  const response = await fetch('http://localhost:3000/wods', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: wodData.title,
      description: wodData.description,
      date: wodData.date, // "2025-10-28"
      track: wodData.track || 'RX',
      createdById: adminId,
    }),
  });

  const wod = await response.json();
  console.log('WOD creado:', wod);
  return wod;
};
```

---

### Cargar WODs del mes (Admin)

```typescript
const loadMonthWODs = async (adminId) => {
  const wods = [
    {
      title: 'Lunes 4/11 - Fuerza',
      description: 'Back Squat 5x5\nDeadlift 3x8',
      date: '2025-11-04',
      track: 'RX',
    },
    {
      title: 'Martes 5/11 - Metcon',
      description: 'Cindy AMRAP 20min',
      date: '2025-11-05',
      track: 'RX',
    },
    // ... más WODs
  ];

  const response = await fetch('http://localhost:3000/wods/bulk', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      createdById: adminId,
      wods: wods,
    }),
  });

  const result = await response.json();
  console.log(result); // "5 WODs creados exitosamente"
};
```

---

### Ver WOD del día (Atleta)

```typescript
const getTodayWOD = async () => {
  const response = await fetch('http://localhost:3000/wods/today', {
    credentials: 'include',
  });

  const data = await response.json();

  if (data.wods.length === 0) {
    console.log('No hay WOD para hoy');
    return null;
  }

  console.log('WOD de hoy:', data.wods[0]);
  return data.wods[0];
};
```

---

### Ver calendario del mes (Atleta)

```typescript
const getMonthCalendar = async (year, month) => {
  const response = await fetch(
    `http://localhost:3000/wods/month?year=${year}&month=${month}`,
    { credentials: 'include' },
  );

  const data = await response.json();
  console.log(`${data.totalWODs} WODs en ${month}/${year}`);

  // Crear mapa de fechas con WODs
  const calendarMap = {};
  data.wods.forEach((wod) => {
    const dateKey = wod.date.split('T')[0];
    if (!calendarMap[dateKey]) {
      calendarMap[dateKey] = [];
    }
    calendarMap[dateKey].push(wod);
  });

  return calendarMap;
};
```

---

### Ver histórico de WODs

```typescript
const getWODHistory = async (limit = 20) => {
  const response = await fetch(
    `http://localhost:3000/wods/history/past?limit=${limit}`,
    { credentials: 'include' },
  );

  const data = await response.json();
  console.log('Histórico:', data.wods);
  return data.wods;
};
```

---

## 📱 Componente React de Ejemplo

```tsx
import { useState, useEffect } from 'react';

export function TodayWOD() {
  const [wod, setWod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayWOD();
  }, []);

  const fetchTodayWOD = async () => {
    try {
      const response = await fetch('http://localhost:3000/wods/today', {
        credentials: 'include',
      });

      const data = await response.json();
      setWod(data.wods[0] || null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando WOD del día...</div>;

  if (!wod) {
    return <div>No hay WOD programado para hoy</div>;
  }

  return (
    <div className="wod-card">
      <h2>{wod.title}</h2>
      <p className="date">{new Date(wod.date).toLocaleDateString()}</p>
      {wod.track && <span className="badge">{wod.track}</span>}
      <pre className="description">{wod.description}</pre>
    </div>
  );
}
```

---

## 🗓️ Flujo de Trabajo Recomendado

### Para el ADMIN:

1. **Al inicio del mes**:
   - Carga todos los WODs del mes usando `POST /wods/bulk`
   - O carga semana por semana

2. **Durante el mes**:
   - Puede modificar WODs específicos con `PUT /wods/:id`
   - Agregar WODs adicionales con `POST /wods`
   - Ver el calendario con `GET /wods/month`

3. **Gestión diaria**:
   - Verificar el WOD del día con `GET /wods/today`
   - Hacer ajustes de último momento si es necesario

### Para los ATLETAS:

1. **Vista diaria** (pantalla principal):
   - Mostrar `GET /wods/today`
   - Botón para ver histórico
   - Botón para ver calendario del mes

2. **Vista calendario**:
   - Calendario mensual con `GET /wods/month`
   - Click en fecha para ver detalle del WOD

3. **Vista histórico**:
   - Lista de WODs pasados con `GET /wods/history/past`
   - Para revisar entrenamientos anteriores

---

## 🎨 Ideas para el Frontend

### Pantalla Principal (Atleta)

```
┌─────────────────────────────────┐
│   WOD DEL DÍA - 27 Oct 2025    │
├─────────────────────────────────┤
│                                 │
│   🏋️ FRAN                       │
│   📍 RX                         │
│                                 │
│   21-15-9                       │
│   Thrusters (95/65 lb)         │
│   Pull-ups                      │
│                                 │
│   [Ver Histórico] [Calendario]  │
└─────────────────────────────────┘
```

### Panel Admin

```
┌─────────────────────────────────┐
│   GESTIÓN DE WODS              │
├─────────────────────────────────┤
│                                 │
│   [+ Crear WOD]                │
│   [📅 Cargar Mes Completo]     │
│   [📊 Ver Calendario]          │
│                                 │
│   WODs Próximos:               │
│   • 28 Oct - Helen             │
│   • 29 Oct - Grace             │
│   • 30 Oct - Murph             │
│                                 │
└─────────────────────────────────┘
```

---

¡Sistema de WODs completo y listo para usar! 🎉
