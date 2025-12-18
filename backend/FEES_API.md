# API de Cuotas (Fees)

Módulo completo para gestionar las cuotas/tarifas del gimnasio.

## Modelo de Datos

```prisma
model FeeSettings {
  id          String    @id @default(cuid())
  amount      Decimal   @db.Decimal(10, 2)
  currency    String    @default("ARS")
  validFrom   DateTime
  validUntil  DateTime?
  isActive    Boolean   @default(false)
  description String?
  coachId     String?   // Opcional, para multitenancy
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## Endpoints Disponibles

### 1. Listar todas las cuotas

```http
GET /fees
GET /fees?coachId=xxx
```

**Respuesta:**

```json
[
  {
    "id": "clxxx123",
    "amount": "50000.00",
    "currency": "ARS",
    "validFrom": "2025-10-01T00:00:00.000Z",
    "validUntil": "2025-12-31T23:59:59.999Z",
    "isActive": true,
    "description": "Cuota mensual - Octubre 2025",
    "coachId": null,
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-01T10:00:00.000Z",
    "coach": null
  }
]
```

---

### 2. Obtener cuota vigente actual

```http
GET /fees/current
GET /fees/current?coachId=xxx
```

Devuelve la cuota que está **activa** y cubre el período actual (validFrom <= hoy <= validUntil).

**Respuesta:**

```json
{
  "id": "clxxx123",
  "amount": "50000.00",
  "currency": "ARS",
  "validFrom": "2025-10-01T00:00:00.000Z",
  "validUntil": "2025-12-31T23:59:59.999Z",
  "isActive": true,
  "description": "Cuota mensual - Q4 2025",
  "coachId": null,
  "createdAt": "2025-10-01T10:00:00.000Z",
  "updatedAt": "2025-10-01T10:00:00.000Z",
  "coach": null
}
```

---

### 3. Obtener una cuota por ID

```http
GET /fees/:id
```

**Ejemplo:**

```http
GET /fees/clxxx123
```

---

### 4. Crear nueva cuota

```http
POST /fees
Content-Type: application/json

{
  "amount": 50000,
  "currency": "ARS",
  "validFrom": "2025-11-01T00:00:00.000Z",
  "validUntil": "2025-11-30T23:59:59.999Z",
  "isActive": false,
  "description": "Cuota mensual - Noviembre 2025",
  "coachId": null
}
```

**Campos:**

- `amount` (requerido): Monto en pesos (se almacena como decimal)
- `currency` (opcional): Por defecto "ARS"
- `validFrom` (requerido): Fecha de inicio de vigencia (ISO 8601)
- `validUntil` (opcional): Fecha de fin de vigencia (ISO 8601). Si es null, es indefinido
- `isActive` (opcional): Por defecto `false`. Indica si es la cuota activa
- `description` (opcional): Descripción de la cuota
- `coachId` (opcional): Para asociar la cuota a un coach específico (multitenancy)

**Respuesta:**

```json
{
  "id": "clxxx456",
  "amount": "50000.00",
  "currency": "ARS",
  "validFrom": "2025-11-01T00:00:00.000Z",
  "validUntil": "2025-11-30T23:59:59.999Z",
  "isActive": false,
  "description": "Cuota mensual - Noviembre 2025",
  "coachId": null,
  "createdAt": "2025-10-20T16:56:00.000Z",
  "updatedAt": "2025-10-20T16:56:00.000Z",
  "coach": null
}
```

---

### 5. Actualizar cuota

```http
PATCH /fees/:id
Content-Type: application/json

{
  "amount": 55000,
  "description": "Cuota mensual - Noviembre 2025 (actualizada)"
}
```

Puedes actualizar cualquiera de estos campos:

- `amount`
- `currency`
- `validFrom`
- `validUntil`
- `isActive`
- `description`

---

### 6. Activar una cuota específica

```http
PATCH /fees/:id/activate
PATCH /fees/:id/activate?coachId=xxx
```

**Comportamiento:**

1. Desactiva todas las cuotas del mismo coach (o globales si no hay coachId)
2. Activa la cuota especificada

Esto asegura que solo haya **una cuota activa** a la vez por coach.

**Ejemplo:**

```http
PATCH /fees/clxxx456/activate
```

**Respuesta:**

```json
{
  "id": "clxxx456",
  "amount": "50000.00",
  "isActive": true,
  "...": "..."
}
```

---

### 7. Eliminar cuota

```http
DELETE /fees/:id
```

**Ejemplo:**

```http
DELETE /fees/clxxx456
```

---

## Casos de Uso

### Caso 1: Configurar la primera cuota

```bash
# 1. Crear la cuota
POST /fees
{
  "amount": 50000,
  "validFrom": "2025-10-01T00:00:00.000Z",
  "validUntil": null,  # Sin fecha de fin = indefinida
  "description": "Cuota mensual estándar"
}

# 2. Activarla
PATCH /fees/{id}/activate
```

### Caso 2: Cambiar el precio para el próximo mes

```bash
# 1. Crear nueva cuota con validFrom futuro
POST /fees
{
  "amount": 55000,
  "validFrom": "2025-11-01T00:00:00.000Z",
  "description": "Cuota mensual - Aumento noviembre"
}

# 2. El día que comience el período, activarla
PATCH /fees/{nuevo-id}/activate
```

### Caso 3: Consultar cuota vigente desde el frontend

```bash
GET /fees/current

# Usar el amount devuelto para mostrar al usuario
```

### Caso 4: Multitenancy - Cuotas por coach

```bash
# Coach A crea su cuota
POST /fees
{
  "amount": 40000,
  "validFrom": "2025-10-01T00:00:00.000Z",
  "coachId": "coach-a-id"
}

# Coach B crea su cuota
POST /fees
{
  "amount": 60000,
  "validFrom": "2025-10-01T00:00:00.000Z",
  "coachId": "coach-b-id"
}

# Obtener cuota vigente del Coach A
GET /fees/current?coachId=coach-a-id
```

---

## Integración con Pagos

Cuando crees un pago, puedes consultar la cuota vigente:

```javascript
// Frontend
const currentFee = await fetch('http://localhost:3000/fees/current').then((r) =>
  r.json(),
);

// Crear pago con ese monto
await fetch('http://localhost:3000/payments', {
  method: 'POST',
  body: JSON.stringify({
    athleteId: 'xxx',
    amount: parseFloat(currentFee.amount),
    periodStart: '2025-10-20',
    periodEnd: '2025-11-20',
  }),
});
```

---

## Notas Importantes

1. **Solo una cuota activa a la vez**: El endpoint `/activate` se encarga de esto automáticamente
2. **Cuota vigente**: Se determina por `isActive: true` + que el período cubra la fecha actual
3. **Multitenancy**: Si usas `coachId`, cada coach puede tener sus propias cuotas
4. **Decimal precision**: Los montos se almacenan con 2 decimales de precisión
5. **Fechas ISO 8601**: Todas las fechas deben enviarse en formato ISO (ej: "2025-10-20T00:00:00.000Z")
