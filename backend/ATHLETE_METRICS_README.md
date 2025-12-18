# 📊 Sistema de Métricas de Atletas - CrossFit Tracking

## 🎯 Descripción

Sistema completo de seguimiento y medición para atletas de CrossFit y fitness. Permite registrar y hacer seguimiento de:

- Datos personales y de salud
- Métricas corporales (peso, grasa, perímetros)
- Personal Records (1RM en levantamientos)
- Benchmark WODs (Fran, Murph, Cindy, etc.)

---

## 📋 Modelos

### **AthleteProfile** (Actualizado)

Datos personales del atleta:

```typescript
{
  // Básicos
  fullName: string
  birthDate?: Date
  active: boolean

  // Físicos
  height?: number          // cm
  gender?: string          // "MALE", "FEMALE", "OTHER"
  bloodType?: string       // "A+", "O-", etc.

  // Ubicación
  city?: string
  province?: string
  country?: string         // default: "Argentina"

  // Emergencia
  emergencyContactName?: string
  emergencyContactPhone?: string

  // Salud y objetivos
  goals?: string           // Objetivos personales
  injuries?: string        // Historial de lesiones
  medications?: string     // Medicaciones actuales

  // Relaciones
  coachId?: string
  metrics: AthleteMetric[] // Historial de mediciones
}
```

### **AthleteMetric** (Nuevo)

Registro histórico de métricas con fecha:

```typescript
{
  id: string
  athleteId: string
  date: DateTime           // Fecha de la medición

  // Métricas corporales
  weight?: number          // kg
  bodyFatPercent?: number  // %
  muscleMass?: number      // kg
  bmi?: number             // Calculado automáticamente

  // Perímetros (cm)
  waist?: number           // Cintura
  hip?: number             // Cadera
  chest?: number           // Pecho
  rightArm?: number
  leftArm?: number
  rightThigh?: number
  leftThigh?: number

  // 1RM - One Rep Max (kg)
  backSquat?: number       // Sentadilla trasera
  frontSquat?: number      // Sentadilla frontal
  deadlift?: number        // Peso muerto
  benchPress?: number      // Press de banca
  shoulderPress?: number   // Press militar
  cleanAndJerk?: number    // Cargada y envión
  snatch?: number          // Arrancada

  // Benchmark WODs
  franTime?: number        // Fran en segundos
  murphTime?: number       // Murph en segundos
  cindyRounds?: number     // Cindy - rounds
  graceTime?: number       // Grace en segundos
  helenTime?: number       // Helen en segundos

  // Otros
  maxPullUps?: number      // Pull-ups consecutivos
  maxPushUps?: number      // Push-ups consecutivos
  plankTime?: number       // Plancha en segundos

  notes?: string           // Notas adicionales
}
```

---

## 🚀 Endpoints

### **Crear Atleta** (actualizado)

```http
POST /athletes
Content-Type: application/json

{
  "email": "atleta@example.com",
  "password": "password123",
  "fullName": "Juan Pérez",
  "phone": "+5491112345678",
  "birthDate": "1990-05-15",
  "coachId": "coach_id",

  // Nuevos campos opcionales
  "height": 175,
  "gender": "MALE",
  "bloodType": "O+",
  "city": "Buenos Aires",
  "province": "CABA",
  "country": "Argentina",
  "emergencyContactName": "María Pérez",
  "emergencyContactPhone": "+5491112345679",
  "goals": "Mejorar sentadilla a 120kg",
  "injuries": "Lesión de rodilla 2023",
  "medications": "Ninguna"
}
```

### **Crear Medición**

```http
POST /athlete-metrics
Content-Type: application/json

{
  "athleteId": "athlete_id",
  "date": "2025-10-22",

  // Métricas corporales
  "weight": 75.5,
  "bodyFatPercent": 15.2,
  "muscleMass": 64.0,

  // Perímetros
  "waist": 80,
  "chest": 100,
  "rightArm": 35,

  // 1RM
  "backSquat": 120,
  "deadlift": 150,
  "benchPress": 90,

  // WODs
  "franTime": 360,      // 6 minutos
  "cindyRounds": 25,

  // Otros
  "maxPullUps": 15,
  "notes": "Buen progreso en squat"
}
```

**Nota**: El BMI se calcula automáticamente si hay peso y altura en el perfil del atleta.

### **Obtener Historial Completo**

```http
GET /athlete-metrics/athlete/:athleteId
```

**Respuesta**:

```json
[
  {
    "id": "metric_id",
    "date": "2025-10-22T00:00:00.000Z",
    "weight": 75.5,
    "bodyFatPercent": 15.2,
    "backSquat": 120,
    ...
  }
]
```

### **Obtener Última Medición**

```http
GET /athlete-metrics/athlete/:athleteId/latest
```

### **Progreso de Peso**

```http
GET /athlete-metrics/athlete/:athleteId/weight-progress?from=2025-01-01&to=2025-10-22
```

**Respuesta**:

```json
[
  {
    "date": "2025-01-15T00:00:00.000Z",
    "weight": 78.0,
    "bodyFatPercent": 18.5,
    "bmi": 25.5
  },
  {
    "date": "2025-03-20T00:00:00.000Z",
    "weight": 76.5,
    "bodyFatPercent": 16.8,
    "bmi": 25.0
  }
]
```

### **Personal Records (PRs)**

```http
GET /athlete-metrics/athlete/:athleteId/personal-records
```

**Respuesta**:

```json
{
  "backSquat": {
    "max": 120,
    "date": "2025-10-22T00:00:00.000Z"
  },
  "deadlift": {
    "max": 150,
    "date": "2025-09-15T00:00:00.000Z"
  },
  "benchPress": {
    "max": 90,
    "date": "2025-10-10T00:00:00.000Z"
  },
  ...
}
```

### **Benchmark Records**

```http
GET /athlete-metrics/athlete/:athleteId/benchmark-records
```

**Respuesta**:

```json
{
  "fran": {
    "best": 360, // 6:00 minutos
    "date": "2025-10-22T00:00:00.000Z"
  },
  "murph": {
    "best": 2400, // 40:00 minutos
    "date": "2025-08-15T00:00:00.000Z"
  },
  "cindy": {
    "best": 25, // 25 rounds
    "date": "2025-10-01T00:00:00.000Z"
  }
}
```

### **Actualizar Medición**

```http
PATCH /athlete-metrics/:id
Content-Type: application/json

{
  "weight": 76.0,
  "notes": "Medición actualizada"
}
```

### **Eliminar Medición**

```http
DELETE /athlete-metrics/:id
```

---

## 📈 Ejemplos de Uso

### Flujo típico: Nuevo atleta con primera medición

```javascript
// 1. Crear atleta con datos personales
const athlete = await fetch('http://localhost:3000/athletes', {
  method: 'POST',
  body: JSON.stringify({
    email: 'juan@example.com',
    password: 'password123',
    fullName: 'Juan Pérez',
    height: 175,
    gender: 'MALE',
    city: 'Buenos Aires',
    goals: 'Mejorar fuerza general',
  }),
});

// 2. Primera medición
await fetch('http://localhost:3000/athlete-metrics', {
  method: 'POST',
  body: JSON.stringify({
    athleteId: athlete.id,
    weight: 75,
    bodyFatPercent: 18,
    backSquat: 100,
    deadlift: 130,
    franTime: 420,
  }),
});

// 3. Después de 2 meses - Nueva medición
await fetch('http://localhost:3000/athlete-metrics', {
  method: 'POST',
  body: JSON.stringify({
    athleteId: athlete.id,
    weight: 76,
    bodyFatPercent: 15,
    backSquat: 120, // ⬆️ Mejoró +20kg
    deadlift: 150, // ⬆️ Mejoró +20kg
    franTime: 360, // ⬆️ Mejoró 1 minuto
  }),
});

// 4. Ver progreso
const progress = await fetch(
  `http://localhost:3000/athlete-metrics/athlete/${athlete.id}/weight-progress`,
);

// 5. Ver PRs
const prs = await fetch(
  `http://localhost:3000/athlete-metrics/athlete/${athlete.id}/personal-records`,
);
```

---

## 🎓 Benchmark WODs de CrossFit

| WOD       | Descripción                                                    | Registro           |
| --------- | -------------------------------------------------------------- | ------------------ |
| **Fran**  | 21-15-9 Thrusters (43kg) + Pull-ups                            | Tiempo (segundos)  |
| **Murph** | 1 mile run, 100 pull-ups, 200 push-ups, 300 squats, 1 mile run | Tiempo (segundos)  |
| **Cindy** | AMRAP 20min: 5 pull-ups, 10 push-ups, 15 squats                | Rounds completados |
| **Grace** | 30 Clean & Jerk (60kg) for time                                | Tiempo (segundos)  |
| **Helen** | 3 rounds: 400m run, 21 KB swings (24kg), 12 pull-ups           | Tiempo (segundos)  |

---

## 🧮 Cálculos Automáticos

### BMI (Índice de Masa Corporal)

```typescript
BMI = peso (kg) / (altura (m))²
```

**Ejemplo**: 75kg / (1.75m)² = 24.5

**Clasificación**:

- < 18.5: Bajo peso
- 18.5-24.9: Normal
- 25-29.9: Sobrepeso
- ≥ 30: Obesidad

---

## 📊 Visualizaciones Sugeridas (Frontend)

### Gráficos recomendados:

1. **Progreso de Peso**: Línea temporal
2. **Composición Corporal**: Gráfico de torta (% grasa, % músculo)
3. **Evolución de PRs**: Barras comparativas
4. **Benchmark WODs**: Línea de tiempo con mejores marcas
5. **Perímetros**: Radar chart comparando mediciones

---

## 🔐 Validaciones

### Al crear medición:

- ✅ `athleteId` debe existir
- ✅ `date` no puede ser futura
- ✅ Valores numéricos deben ser positivos
- ✅ Porcentajes entre 0-100

### Al calcular BMI:

- ✅ Requiere peso en la medición
- ✅ Requiere altura en el perfil del atleta

---

## 🚀 Próximas Mejoras

- [ ] Dashboard de estadísticas del atleta
- [ ] Comparación con promedios del box
- [ ] Exportar progreso a PDF
- [ ] Fotos de progreso (antes/después)
- [ ] Recordatorios para medir periódicamente
- [ ] Objetivos con metas específicas
- [ ] Rankings por PR en el box
- [ ] Integración con dispositivos wearables

---

## 📝 Notas Importantes

### ⚠️ Datos Sensibles

- Historial médico (injuries, medications) debe manejarse con privacidad
- Contacto de emergencia solo visible para coaches y admin
- Datos corporales privados por defecto

### 🔄 Frecuencia Recomendada

- **Peso**: Semanal
- **Perímetros**: Mensual
- **1RM**: Cada 6-8 semanas
- **Benchmark WODs**: Cada 3-6 meses

### 💡 Tips

- El BMI se calcula automáticamente si hay altura en el perfil
- Benchmark times en segundos (facilita cálculos)
- Permitir solo valores positivos en métricas
- Registrar condiciones especiales en `notes`
