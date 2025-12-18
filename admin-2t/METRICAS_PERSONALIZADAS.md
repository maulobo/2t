# Metricas Personalizadas - Implementacion

## Objetivo
Permitir a los usuarios agregar metricas dinamicas personalizadas ademas de las metricas estandar (peso, 1RM, benchmarks, etc).

## Cambios Realizados

### 1. Actualizacion de Tipos (`/src/types/athlete.ts`)

#### AthleteMetric Interface
Agregado campo:
```typescript
customMetrics: Record<string, number> | null; // Cualquier metrica adicional
```

#### CreateAthleteMetricDto
Agregado campo:
```typescript
customMetrics?: Record<string, number>;
```

#### UpdateAthleteMetricDto
Ya incluye `customMetrics` porque hereda de `CreateAthleteMetricDto`

### 2. Nuevo Componente: CustomMetricsManager (`/src/components/athletes/CustomMetricsManager.tsx`)

**Caracteristicas:**
- Lista de metricas personalizadas existentes con nombre y valor
- Boton editar para modificar valores
- Boton eliminar para quitar metricas
- Formulario para agregar nuevas metricas (nombre + valor)
- Formateo automatico de nombres (snake_case a Title Case)
- Validacion de valores numericos
- Ejemplos visuales cuando no hay metricas
- Dark mode completo

**Funcionalidad:**
- `handleAdd()` - Agrega nueva metrica (convierte nombre a snake_case)
- `handleEdit()` - Activa modo edicion
- `handleSaveEdit()` - Guarda cambio de valor
- `handleDelete()` - Elimina metrica
- `formatMetricName()` - Convierte snake_case a Title Case

### 3. Actualizacion de MetricForm (`/src/components/athletes/MetricForm.tsx`)

**Cambios:**
- Importado `CustomMetricsManager`
- Agregado `customMetrics: {}` en estado inicial de `formData`
- Agregado handling de `customMetrics` en `useEffect` para edicion
- Nueva funcion `handleCustomMetricsChange()` para actualizar customMetrics
- Nueva seccion en tabs: "Personalizadas"
- Renderiza `CustomMetricsManager` cuando `activeSection === "custom"`

### 4. Actualizacion de AthleteMetrics (`/src/components/athletes/AthleteMetrics.tsx`)

**Vista de Ultima Medicion:**
- Nueva seccion "Metricas Personalizadas" que se muestra si hay customMetrics
- Renderiza grid con tarjetas para cada metrica personalizada
- Usa `formatMetricName()` para mostrar nombres legibles

**Tabla de Historial:**
- Nueva columna "Personalizadas"
- Muestra cantidad de metricas personalizadas (ej: "3 metrica(s)")
- Muestra "-" si no hay metricas personalizadas

**Funcion auxiliar:**
```typescript
function formatMetricName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
```

## Ejemplo de Uso

### Request al Backend
```json
POST /athlete-metrics
{
  "athleteId": "clx123",
  "date": "2025-10-22",
  
  // Campos estandar
  "weight": 84,
  "backSquat": 120,
  "deadlift": 150,
  
  // Metricas personalizadas
  "customMetrics": {
    "overhead_squat": 85,
    "pistol_squat": 45,
    "turkish_get_up": 32,
    "mi_wod_personalizado": 240,
    "handstand_pushups": 15,
    "box_jump_height": 75
  }
}
```

### Como se ve en el Front

#### En el Formulario:
1. Usuario va a tab "Personalizadas"
2. Ve lista de metricas existentes (si esta editando)
3. Puede editar/eliminar metricas existentes
4. Agrega nueva metrica:
   - Nombre: "Overhead Squat" → se guarda como "overhead_squat"
   - Valor: 85
   - Clic en "Agregar Metrica"

#### En la Vista de Ultima Medicion:
Seccion "Metricas Personalizadas" muestra:
- **Overhead Squat**: 85
- **Pistol Squat**: 45
- **Turkish Get Up**: 32
- **Mi Wod Personalizado**: 240
- **Handstand Pushups**: 15
- **Box Jump Height**: 75

#### En el Historial:
Columna "Personalizadas" muestra: "6 metrica(s)"

## Ejemplos de Metricas Personalizadas

El componente sugiere:
- **Overhead Squat** - 85 kg
- **Pistol Squat** - 45 kg
- **Turkish Get Up** - 32 kg
- **Handstand Push-ups** - 15 reps
- **Box Jump** - 75 cm
- **WOD personalizado** - 240 segundos

Pero puede ser CUALQUIER metrica:
- Ejercicios especificos del gimnasio
- WODs personalizados
- Mediciones de flexibilidad
- Marcas de velocidad
- Distancias
- Tiempos de sprints
- Lo que el coach/atleta necesite medir

## Ventajas

1. **Flexibilidad Total**: No limitado a campos predefinidos
2. **Sin Cambios en DB Schema**: Se guarda en campo JSON
3. **Facil de Usar**: Interfaz intuitiva para agregar/editar
4. **Escalable**: Puede agregarse infinitas metricas
5. **Personalizable por Atleta**: Cada atleta puede tener metricas diferentes
6. **Historico Completo**: Se guardan en cada medicion

## Integracion con Backend

El backend debe:
1. Aceptar campo `customMetrics` en POST/PATCH
2. Validar que sea objeto con valores numericos
3. Guardarlo en campo JSON en base de datos
4. Devolverlo en GET endpoints
5. Incluirlo en respuestas de progreso/records si aplica

## Proximos Pasos Sugeridos

1. Agregar graficos para metricas personalizadas especificas
2. Permitir copiar metricas entre atletas
3. Sugerir metricas basadas en historial del gimnasio
4. Exportar metricas personalizadas a CSV/PDF
5. Agregar templates de metricas por deporte (CrossFit, Weightlifting, etc)
6. Permitir unidades de medida personalizadas (kg, lbs, cm, in, seg, min)
