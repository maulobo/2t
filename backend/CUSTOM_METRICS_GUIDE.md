# Guía de Métricas Personalizadas (Custom Metrics)

## 📊 Enfoque Híbrido

El sistema de métricas de AthleteMetric usa un **enfoque híbrido**:

### Campos Estándar (Fijos)

Levantamientos y métricas más comunes en CrossFit tienen campos propios en la base de datos:

- **Levantamientos 1RM**: backSquat, frontSquat, deadlift, benchPress, shoulderPress, cleanAndJerk, snatch
- **Benchmark WODs**: franTime, murphTime, cindyRounds, graceTime, helenTime
- **Métricas Corporales**: weight, bodyFatPercent, muscleMass, bmi
- **Perímetros**: waist, hip, chest, rightArm, leftArm, rightThigh, leftThigh
- **Otros**: maxPullUps, maxPushUps, plankTime

**Ventajas de campos fijos:**

- ✅ Fácil de consultar con SQL
- ✅ Fácil de filtrar y ordenar
- ✅ Mejor rendimiento en queries
- ✅ Validación automática de tipos

### Campo JSON Dinámico (customMetrics)

Para **cualquier ejercicio o métrica que no esté en la lista estándar**, puedes usar el campo `customMetrics`.

**Ventajas del JSON:**

- ✅ Flexibilidad total
- ✅ Agregar nuevos ejercicios sin modificar el backend
- ✅ Cada coach puede definir sus propios ejercicios
- ✅ Sin límite de campos

---

## 🚀 Uso desde el Frontend

### Crear Métrica con Campos Estándar + Personalizados

```json
POST /athlete-metrics
{
  "athleteId": "cmgza3v0k00019k4nikvbgqq5",
  "date": "2025-10-22",

  // Campos estándar (campos fijos en DB)
  "weight": "84",
  "backSquat": "120",
  "deadlift": "150.5",
  "franTime": "180",

  // Métricas personalizadas (JSON dinámico)
  "customMetrics": {
    "overheadSquat": 80,
    "pistolSquat": 45,
    "turkishGetUp": 32,
    "handstandWalk": 50,
    "doubleUnders": 100,
    "ropeClimb": 5,
    "miWodPersonalizado": 240
  },

  "notes": "Excelente sesión, nuevo PR en sentadilla"
}
```

### Actualizar Solo Métricas Personalizadas

```json
PATCH /athlete-metrics/:id
{
  "customMetrics": {
    "overheadSquat": 85,  // Actualizado!
    "pistolSquat": 45,
    "boxJump": 30  // Nuevo ejercicio agregado!
  }
}
```

### Leer Métricas

```json
GET /athlete-metrics/athlete/:athleteId/latest

Response:
{
  "id": "xxx",
  "athleteId": "xxx",
  "date": "2025-10-22T00:00:00.000Z",
  "weight": 84,
  "backSquat": 120,
  "deadlift": 150.5,
  "customMetrics": {
    "overheadSquat": 85,
    "pistolSquat": 45,
    "boxJump": 30
  },
  "notes": "..."
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Coach de CrossFit - Ejercicios Olímpicos Extra

```json
{
  "customMetrics": {
    "powerClean": 95,
    "powerSnatch": 70,
    "hangClean": 90,
    "hangSnatch": 68,
    "cleanPull": 110,
    "snatchPull": 95
  }
}
```

### Ejemplo 2: Coach de Gimnasia - Skills

```json
{
  "customMetrics": {
    "muscleUps": 10,
    "handstandPushUps": 15,
    "pistolSquats": 20,
    "lSit": 45, // segundos
    "frontLever": 10, // segundos
    "backLever": 8 // segundos
  }
}
```

### Ejemplo 3: Coach de Funcional - WODs Personalizados

```json
{
  "customMetrics": {
    "wodTuesday": 720, // tiempo en segundos
    "wodThursday": 18, // rounds completados
    "emomChallengeMinutes": 12
  }
}
```

### Ejemplo 4: Mix de Todo

```json
{
  // Campos estándar
  "backSquat": 120,
  "deadlift": 150,
  "franTime": 180,

  // Personalizados
  "customMetrics": {
    "overheadSquat": 85,
    "powerClean": 95,
    "muscleUps": 10,
    "wodPersonalizado": 600,
    "skillDeLaSemana": 8
  }
}
```

---

## 🔍 Consultas en el Frontend

### Obtener Métricas Personalizadas

```typescript
// En el frontend
const response = await fetch(`/athlete-metrics/athlete/${athleteId}/latest`);
const data = await response.json();

// Acceder a campos estándar
console.log(data.backSquat); // 120

// Acceder a métricas personalizadas
console.log(data.customMetrics.overheadSquat); // 85
console.log(data.customMetrics.pistolSquat); // 45

// Iterar sobre todas las métricas personalizadas
Object.entries(data.customMetrics || {}).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});
```

### Mostrar Historial de una Métrica Personalizada

```typescript
const history = await fetch(`/athlete-metrics/athlete/${athleteId}`);
const metrics = await history.json();

// Filtrar solo las mediciones que tienen "overheadSquat"
const overheadSquatHistory = metrics
  .filter((m) => m.customMetrics?.overheadSquat)
  .map((m) => ({
    date: m.date,
    value: m.customMetrics.overheadSquat,
  }));

console.log(overheadSquatHistory);
// [
//   { date: "2025-10-01", value: 75 },
//   { date: "2025-10-15", value: 80 },
//   { date: "2025-10-22", value: 85 }
// ]
```

---

## 📝 Estructura del JSON

El campo `customMetrics` puede contener:

```typescript
interface CustomMetrics {
  [key: string]: number | string;
}
```

**Recomendaciones:**

- Usar camelCase para las keys: `overheadSquat`, `powerClean`
- Valores numéricos para pesos (kg), tiempos (segundos), repeticiones
- Ser consistente con los nombres de ejercicios para facilitar el tracking
- Documentar las unidades en el frontend (kg, segundos, repeticiones)

---

## 🎯 Cuándo Usar Cada Uno

### Usa Campos Estándar cuando:

- Es un ejercicio común en CrossFit
- Necesitas hacer queries SQL complejas
- Quieres filtrar/ordenar por ese campo
- Ya existe en el schema

### Usa customMetrics cuando:

- Es un ejercicio personalizado de tu box
- Es una métrica única que definiste
- Es un WOD con nombre personalizado
- No quieres esperar a que agreguen el campo al backend
- Experimentas con nuevos ejercicios

---

## 🔧 Backend - Conversión Automática

El backend convierte automáticamente todos los campos numéricos que vienen como strings:

```json
// Frontend envía (strings):
{
  "weight": "84",
  "backSquat": "120",
  "customMetrics": {
    "overheadSquat": "85"  // ⚠️ Nota: también puede ser string
  }
}

// Backend guarda (numbers):
{
  "weight": 84,
  "backSquat": 120,
  "customMetrics": {
    "overheadSquat": "85"  // JSON se guarda tal cual
  }
}
```

**Importante:** Los valores dentro de `customMetrics` se guardan tal cual los envías (no se convierten automáticamente). Si quieres números, envía números desde el frontend.

---

## 📊 Ejemplo Completo de Flujo

### 1. Coach crea ejercicio personalizado en el frontend

```typescript
// Frontend - Configuración de ejercicios personalizados
const customExercises = [
  { name: 'Overhead Squat', key: 'overheadSquat', unit: 'kg', type: '1RM' },
  { name: 'Pistol Squat', key: 'pistolSquat', unit: 'kg', type: '1RM' },
  { name: 'Box Jump', key: 'boxJump', unit: 'cm', type: 'max' },
];
```

### 2. Atleta registra nueva métrica

```typescript
const newMetric = {
  athleteId: athlete.id,
  date: new Date().toISOString(),
  // Campos estándar
  weight: 84,
  backSquat: 120,
  // Personalizados
  customMetrics: {
    overheadSquat: 85,
    pistolSquat: 45,
    boxJump: 75,
  },
};

await fetch('/athlete-metrics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newMetric),
});
```

### 3. Frontend muestra progreso

```typescript
// Obtener historial
const history = await getMetricsHistory(athleteId);

// Graficar progreso de overhead squat
const chartData = history
  .filter((m) => m.customMetrics?.overheadSquat)
  .map((m) => ({
    x: new Date(m.date),
    y: m.customMetrics.overheadSquat,
  }));
```

---

## ✅ Resumen

- **Campos Fijos**: Para ejercicios estándar de CrossFit (ya implementados)
- **customMetrics (JSON)**: Para CUALQUIER ejercicio personalizado que quieras agregar
- **Sin límites**: Agrega los ejercicios que necesites desde el frontend
- **Histórico completo**: Tracking de progreso para todos los ejercicios
- **Flexibilidad total**: Cada coach puede definir sus propias métricas
