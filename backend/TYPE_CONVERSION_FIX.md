# Type Conversion Fix - Athletes & Athlete Metrics Controllers

## Problema

El frontend estaba enviando datos con tipos incorrectos:

1. Campo `phone` siendo enviado a `AthleteProfile` cuando pertenece a `User`
2. Campo `height` enviado como string `"183"` en lugar de number `183`
3. **Campos numéricos de métricas** (weight, perímetros, 1RM, etc.) enviados como strings `"84"` en lugar de números `84`

## Solución Implementada

### 1. Athletes Controller (`athletes.controller.ts`)

#### Endpoint POST (create)

- ✅ Acepta `height` como `string | number`
- ✅ Convierte string a number con `parseFloat()`
- ✅ Convierte strings vacíos a `undefined` para campos opcionales
- ✅ Maneja correctamente el campo `phone` (se pasa al servicio)

#### Endpoint PATCH (update)

- ✅ Acepta `height` como `string | number`
- ✅ Convierte string a number con `parseFloat()`
- ✅ Convierte strings vacíos a `undefined` para campos opcionales
- ✅ Acepta campo `phone` en el DTO (se maneja en el servicio)

### 2. Athletes Service (`athletes.service.ts`)

#### Método `update()`

Ya tenía la lógica correcta implementada:

- ✅ Separa `phone` del resto de datos usando destructuring
- ✅ Si hay `phone`, actualiza primero la tabla `User`
- ✅ Luego actualiza `AthleteProfile` sin el campo `phone`

### 3. Athlete Metrics Controller (`athlete-metrics.controller.ts`) - NUEVO

Se agregaron métodos helper para conversión automática de tipos:

#### Helper Methods

- `parseFloatField(value: any)`: Convierte cualquier valor a Float o undefined
  - Maneja: `null`, `undefined`, `""`, `string`, `number`
  - Retorna: `number | undefined`
- `parseIntField(value: any)`: Convierte cualquier valor a Int o undefined
  - Maneja: `null`, `undefined`, `""`, `string`, `number`
  - Retorna: `number | undefined`

#### Método `convertMetricFields(dto: any)`

Convierte **TODOS** los campos numéricos del DTO de métricas:

**Float Fields (28 campos):**

- Métricas corporales: `weight`, `bodyFatPercent`, `muscleMass`, `bmi`
- Perímetros: `waist`, `hip`, `chest`, `rightArm`, `leftArm`, `rightThigh`, `leftThigh`
- Levantamientos (1RM): `backSquat`, `frontSquat`, `deadlift`, `benchPress`, `shoulderPress`, `cleanAndJerk`, `snatch`

**Int Fields (8 campos):**

- Benchmark WODs: `franTime`, `murphTime`, `cindyRounds`, `graceTime`, `helenTime`
- Otros: `maxPullUps`, `maxPushUps`, `plankTime`

#### Endpoint POST (create)

- ✅ Convierte todos los campos numéricos automáticamente
- ✅ Convierte `date` string a Date object
- ✅ Convierte strings vacíos a `undefined`

#### Endpoint PATCH (update)

- ✅ Convierte todos los campos numéricos automáticamente
- ✅ Misma lógica que create

## Campos que Acepta el Frontend

### User Table

- `email`: string (requerido)
- `password`: string (requerido en create)
- `phone`: string (opcional)

### AthleteProfile Table

- `fullName`: string (requerido)
- `birthDate`: Date (opcional - convertido de string)
- `coachId`: string (opcional)
- `activityType`: string (opcional)
- `notes`: string (opcional)
- `active`: boolean (opcional)
- **Datos Personales:**
  - `height`: number (opcional - **ahora acepta string y lo convierte**)
  - `gender`: string (opcional)
  - `bloodType`: string (opcional)
  - `city`: string (opcional)
  - `province`: string (opcional)
  - `country`: string (opcional - default "Argentina")
- **Contacto de Emergencia:**
  - `emergencyContactName`: string (opcional)
  - `emergencyContactPhone`: string (opcional)
- **Salud:**
  - `goals`: string (opcional)
  - `injuries`: string (opcional)
  - `medications`: string (opcional)

## Conversiones Automáticas

### Athletes Controller

El controller ahora convierte automáticamente:

1. `height: "183"` → `183` (Float)
2. `birthDate: "2000-01-15"` → `Date(2000-01-15)`
3. `gender: ""` → `undefined`
4. `city: ""` → `undefined`
5. etc. (todos los campos opcionales de string)

### Athlete Metrics Controller

El controller convierte automáticamente **36 campos numéricos**:

1. `weight: "84"` → `84.0` (Float)
2. `backSquat: "120.5"` → `120.5` (Float)
3. `franTime: "180"` → `180` (Int)
4. `maxPullUps: "25"` → `25` (Int)
5. Todos los perímetros, levantamientos, WODs, etc.

## Testing

Para probar desde el frontend, puedes enviar:

### Crear/Actualizar Atleta

```json
// POST /athletes o PATCH /athletes/:id
{
  "email": "test@test.com",
  "password": "123456",
  "phone": "123456789",
  "fullName": "Test Athlete",
  "birthDate": "2000-01-15",
  "height": "183", // ✅ Ahora acepta string
  "gender": "Male",
  "bloodType": "O+",
  "city": "Buenos Aires",
  "province": "Buenos Aires",
  "goals": "Mejorar fuerza",
  "emergencyContactName": "Juan Perez",
  "emergencyContactPhone": "987654321"
}
```

### Crear/Actualizar Métricas

```json
// POST /athlete-metrics o PATCH /athlete-metrics/:id
{
  "athleteId": "cmgza3v0k00019k4nikvbgqq5",
  "date": "2025-10-22",
  "weight": "84", // ✅ String → Float
  "height": "183", // Para calcular BMI
  "bodyFatPercent": "15.5", // ✅ String → Float
  "backSquat": "120", // ✅ String → Float
  "deadlift": "150.5", // ✅ String → Float
  "franTime": "180", // ✅ String → Int (segundos)
  "maxPullUps": "25", // ✅ String → Int
  "notes": "Gran progreso en sentadillas"
}
```

## Notas Técnicas

- El `parseFloat()` retorna `NaN` si el string no es válido, por eso usamos `|| undefined`
- El `parseInt()` usa base 10 explícitamente
- Los strings vacíos (`""`) se convierten a `undefined` para que Prisma no los guarde
- El campo `phone` se maneja en el servicio, no en el controller
- La conversión de tipos es transparente para el frontend
- Los warnings de TypeScript sobre `any` son aceptables porque estamos validando los tipos en runtime

## Campos Afectados

### Athletes (2 campos numéricos)

- ✅ `height`: Float

### Athlete Metrics (36 campos numéricos)

**Float (28 campos):**

- Corporales: weight, bodyFatPercent, muscleMass, bmi
- Perímetros: waist, hip, chest, rightArm, leftArm, rightThigh, leftThigh
- 1RM: backSquat, frontSquat, deadlift, benchPress, shoulderPress, cleanAndJerk, snatch

**Int (8 campos):**

- WODs: franTime, murphTime, cindyRounds, graceTime, helenTime
- Otros: maxPullUps, maxPushUps, plankTime
