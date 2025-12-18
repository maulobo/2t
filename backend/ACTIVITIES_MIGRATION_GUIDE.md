# Sistema de Actividades - Guía de Migración

## Cambios Realizados

### 1. **Renombrado: WOD → Training (Entrenamiento)**

- `WOD` → `Training`
- `WODAssignment` → `TrainingAssignment`
- Carpeta `src/wods/` → `src/trainings/`
- Archivos renombrados:
  - `wods.service.ts` → `trainings.service.ts`
  - `wods.controller.ts` → `trainings.controller.ts`
  - `wods.module.ts` → `trainings.module.ts`

### 2. **Nuevo Modelo: Activity**

- Representa las actividades/planes del box (CrossFit, Open Box, Funcional, 28T, etc.)
- Campos:
  - `name`: Nombre único de la actividad
  - `description`: Descripción de la actividad
  - `price`: Precio mensual sugerido (opcional)
  - `active`: Si está activa o no
  - `color`: Color para UI
  - `icon`: Icono para UI

### 3. **Actualizado: AthleteActivity**

- Ahora referencia a `Activity` (en lugar de ser solo un string)
- Relaciona atletas con actividades específicas
- Permite múltiples actividades activas por atleta

### 4. **Actualizado: Payment**

- Ahora incluye `activityId` para vincular pagos a actividades específicas
- Eliminados campos deprecated: `quantity`, `pricePerUnit`, `activityType`
- Simplificado: solo `amount` (monto en pesos)

### 5. **Actualizado: Training (antes WOD)**

- Ahora incluye `activityId` para vincular entrenamientos a actividades
- Un entrenamiento puede ser para "CrossFit", otro para "Open Box", etc.
- Todos los endpoints ahora soportan filtro `?activityId=xxx`

## Endpoints Actualizados

Todos los endpoints cambiaron de `/wods` a `/trainings`:

### Admin (ADMIN, COACH)

- `POST /trainings` - Crear entrenamiento
- `POST /trainings/bulk` - Crear múltiples entrenamientos
- `PUT /trainings/:id` - Actualizar entrenamiento
- `DELETE /trainings/:id` - Eliminar entrenamiento

### Públicos (Autenticados)

- `GET /trainings/today?activityId=xxx` - Entrenamientos de hoy
- `GET /trainings/date?date=2025-11-01&activityId=xxx` - Por fecha
- `GET /trainings/month?year=2025&month=11&activityId=xxx` - Por mes
- `GET /trainings/range?startDate=...&endDate=...&activityId=xxx` - Por rango
- `GET /trainings/history/past?limit=20&activityId=xxx` - Histórico
- `GET /trainings/upcoming/future?limit=10&activityId=xxx` - Próximos
- `GET /trainings?page=1&limit=30&activityId=xxx` - Todos (paginado)
- `GET /trainings/:id` - Por ID

## Próximos Pasos

### 1. **Migración de Base de Datos** ⚠️

Necesitas aplicar la migración para:

- Crear tabla `Activity`
- Renombrar `WOD` → `Training`
- Renombrar `WODAssignment` → `TrainingAssignment`
- Actualizar `AthleteActivity` para referenciar `Activity`
- Actualizar `Payment` para incluir `activityId`

**IMPORTANTE**: Hay datos existentes que deben ser preservados.

### 2. **Crear Actividades Iniciales**

Una vez aplicada la migración, crear actividades básicas:

```typescript
// Ejemplos:
- CrossFit
- Open Box
- Funcional
- 28T
- Musculación
```

### 3. **Migrar Datos Existentes** (si hay)

- Migrar entrenamientos existentes
- Asociar pagos antiguos a actividades
- Actualizar athlete activities

### 4. **Endpoints de Activities**

Crear CRUD para gestionar actividades:

```typescript
POST /activities - Crear actividad
GET /activities - Listar todas
PUT /activities/:id - Actualizar
DELETE /activities/:id - Eliminar
GET /athletes/:id/activities - Actividades del atleta
POST /athletes/:id/activities - Asignar actividad al atleta
DELETE /athlete-activities/:id - Desactivar actividad del atleta
```

## Flujo de Uso

1. **Admin crea actividades**: CrossFit, Open Box, etc.
2. **Admin asigna actividades a atletas**: Juan tiene "CrossFit" y "Open Box"
3. **Atleta paga por actividad**: Juan paga su mes de CrossFit
4. **Admin aprueba pago**: Se activa la actividad
5. **Admin carga entrenamientos**: Carga entrenamiento para CrossFit en fecha X
6. **Atleta ve entrenamientos**: Juan ve solo entrenamientos de sus actividades activas

## Beneficios

✅ **Múltiples actividades por atleta**: Un atleta puede tener varias activas simultáneamente
✅ **Pagos específicos**: Cada pago asociado a una actividad
✅ **Entrenamientos filtrados**: Ver solo los de tus actividades
✅ **Escalable**: Fácil agregar nuevas actividades
✅ **Mejor UX**: Interfaz más clara y organizada
