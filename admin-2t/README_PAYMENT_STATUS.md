# 💳 Estado de Pago en Listado de Atletas

## 🎯 Nueva funcionalidad implementada

Se agregó una columna **"Estado de Pago"** en el listado de atletas que muestra:

1. ✅ Si el atleta tiene pagos aprobados
2. ✅ Cuántos días faltan para el vencimiento del último pago
3. ✅ Fecha de vencimiento del último pago
4. ✅ Estado visual con badges de colores

---

## 📊 Estados posibles

### 1. **Sin pagos** 🔴
```
Badge: Rojo "Sin pagos"
Mensaje: "No hay pagos registrados"
```

**Condición**: El atleta no tiene ningún pago aprobado.

**Visual**:
```
┌─────────────────┐
│ 🔴 Sin pagos    │
│ No hay pagos    │
│ registrados     │
└─────────────────┘
```

---

### 2. **Vencido** 🔴
```
Badge: Rojo "Vencido"
Mensaje: "Hace X días"
Info: "Último: DD/MM/YYYY"
```

**Condición**: La fecha de fin del último pago aprobado ya pasó.

**Ejemplo**:
```
┌─────────────────┐
│ 🔴 Vencido      │
│ Hace 5 días     │
│ Último: 15/10   │
└─────────────────┘
```

**Cálculo**:
```typescript
const daysUntilExpiry = getDaysUntilExpiry(lastPayment.periodEnd);
// Si daysUntilExpiry < 0 → Vencido
// Mostrar: Math.abs(daysUntilExpiry) = días transcurridos
```

---

### 3. **Por vencer** 🟡
```
Badge: Amarillo "Por vencer"
Mensaje: "Faltan X días"
Info: "Vence: DD/MM/YYYY"
```

**Condición**: Faltan 7 días o menos para el vencimiento.

**Ejemplo**:
```
┌─────────────────┐
│ 🟡 Por vencer   │
│ Faltan 3 días   │
│ Vence: 23/10    │
└─────────────────┘
```

**Cálculo**:
```typescript
// Si 0 <= daysUntilExpiry <= 7 → Por vencer
```

---

### 4. **Al día** 🟢
```
Badge: Verde "Al día"
Mensaje: "Faltan X días"
Info: "Vence: DD/MM/YYYY"
```

**Condición**: Faltan más de 7 días para el vencimiento.

**Ejemplo**:
```
┌─────────────────┐
│ 🟢 Al día       │
│ Faltan 15 días  │
│ Vence: 05/11    │
└─────────────────┘
```

**Cálculo**:
```typescript
// Si daysUntilExpiry > 7 → Al día
```

---

## 🔧 Implementación técnica

### 1. **Función: getLastApprovedPayment**

Obtiene el último pago aprobado del atleta, ordenado por fecha de fin del período.

```typescript
const getLastApprovedPayment = (payments: Payment[]): Payment | null => {
  const approvedPayments = payments
    .filter((p) => p.status === "APPROVED")
    .sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime());
  
  return approvedPayments[0] || null;
};
```

**Lógica**:
1. Filtra solo pagos con status `APPROVED`
2. Ordena por `periodEnd` descendente (más reciente primero)
3. Retorna el primero (más reciente) o `null` si no hay

---

### 2. **Función: getDaysUntilExpiry**

Calcula la diferencia en días entre hoy y la fecha de vencimiento.

```typescript
const getDaysUntilExpiry = (periodEnd: string): number => {
  const today = new Date();
  const endDate = new Date(periodEnd);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
```

**Ejemplos**:
- `periodEnd = "2025-10-25"`, hoy = `2025-10-20` → `5 días`
- `periodEnd = "2025-10-15"`, hoy = `2025-10-20` → `-5 días` (vencido)

---

### 3. **Función: getPaymentStatusBadge**

Genera el badge con el estado visual según los días hasta el vencimiento.

```typescript
const getPaymentStatusBadge = (athlete: Athlete) => {
  const lastPayment = getLastApprovedPayment(athlete.payments);

  if (!lastPayment) {
    return (
      <div className="flex flex-col items-start">
        <Badge size="sm" color="error">Sin pagos</Badge>
        <span className="mt-1 text-xs text-gray-400">
          No hay pagos registrados
        </span>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry(lastPayment.periodEnd);
  const lastPaymentDate = formatDate(lastPayment.periodEnd);

  // Lógica de badges según daysUntilExpiry
  // ...
};
```

---

## 📋 Estructura de la tabla actualizada

### Columnas (8 total)

| # | Columna | Contenido |
|---|---------|-----------|
| 1 | Atleta | Nombre completo + Email |
| 2 | Edad | Edad calculada desde birthDate |
| 3 | Contacto | Teléfono |
| 4 | Estado | Badge Activo/Inactivo |
| 5 | **Estado de Pago** | **✨ NUEVO - Badge + días + fecha** |
| 6 | WODs | Cantidad de WODs asignados |
| 7 | Acciones | Botones Ver/Editar/Eliminar |

**Nota**: Se eliminó la columna "Pagos" (cantidad) ya que ahora tenemos información más útil en "Estado de Pago".

---

## 🎨 Colores y estilos

### Badges

```typescript
<Badge size="sm" color="error">    // Rojo - Sin pagos / Vencido
<Badge size="sm" color="warning">  // Amarillo - Por vencer
<Badge size="sm" color="success">  // Verde - Al día
```

### Textos

```tsx
// Vencido - Rojo
<span className="text-red-500 dark:text-red-400">
  Hace 5 días
</span>

// Por vencer - Amarillo
<span className="text-yellow-600 dark:text-yellow-400">
  Faltan 3 días
</span>

// Al día - Verde
<span className="text-green-600 dark:text-green-400">
  Faltan 15 días
</span>

// Info secundaria - Gris
<span className="text-gray-400 dark:text-gray-500">
  Vence: 25/10/2025
</span>
```

---

## 🔍 Casos de uso

### Caso 1: Atleta sin pagos
```json
{
  "id": "athlete-1",
  "fullName": "Juan Pérez",
  "payments": []
}
```

**Resultado**:
```
🔴 Sin pagos
No hay pagos registrados
```

---

### Caso 2: Atleta con pago vencido
```json
{
  "payments": [
    {
      "status": "APPROVED",
      "periodEnd": "2025-10-15T00:00:00.000Z"  // Hace 5 días
    }
  ]
}
```

**Resultado** (hoy = 2025-10-20):
```
🔴 Vencido
Hace 5 días
Último: 15/10/2025
```

---

### Caso 3: Atleta por vencer (3 días)
```json
{
  "payments": [
    {
      "status": "APPROVED",
      "periodEnd": "2025-10-23T00:00:00.000Z"  // En 3 días
    }
  ]
}
```

**Resultado** (hoy = 2025-10-20):
```
🟡 Por vencer
Faltan 3 días
Vence: 23/10/2025
```

---

### Caso 4: Atleta al día (15 días)
```json
{
  "payments": [
    {
      "status": "APPROVED",
      "periodEnd": "2025-11-05T00:00:00.000Z"  // En 15 días
    }
  ]
}
```

**Resultado** (hoy = 2025-10-20):
```
🟢 Al día
Faltan 15 días
Vence: 05/11/2025
```

---

### Caso 5: Múltiples pagos (usa el más reciente)
```json
{
  "payments": [
    {
      "status": "APPROVED",
      "periodEnd": "2025-09-30T00:00:00.000Z"  // Vencido
    },
    {
      "status": "APPROVED",
      "periodEnd": "2025-10-31T00:00:00.000Z"  // Vigente ✓
    },
    {
      "status": "PENDING",
      "periodEnd": "2025-11-30T00:00:00.000Z"  // No cuenta (no aprobado)
    }
  ]
}
```

**Resultado**: Usa el pago del 31/10 (más reciente y aprobado)

---

## 📱 Responsive

### Desktop
La columna "Estado de Pago" se muestra completa con todo el detalle.

### Mobile (consideración futura)
Se puede ocultar columnas menos importantes en pantallas pequeñas:

```tsx
<TableCell className="hidden md:table-cell">
  {/* Estado de Pago */}
</TableCell>
```

---

## 🚀 Ventajas de esta implementación

### ✅ Visibilidad inmediata
Los entrenadores/admins pueden ver de un vistazo:
- Quién está al día
- Quién está por vencer (para enviar recordatorio)
- Quién está vencido (para contactar urgente)

### ✅ Filtrado sugerido (próxima mejora)
Agregar filtros:
```tsx
<select>
  <option>Todos</option>
  <option>Al día</option>
  <option>Por vencer</option>
  <option>Vencidos</option>
  <option>Sin pagos</option>
</select>
```

### ✅ Ordenamiento sugerido (próxima mejora)
Ordenar por:
- Días hasta vencimiento (ascendente)
- Fecha de último pago (descendente)

---

## 🎯 Próximas mejoras sugeridas

### 1. **Notificaciones automáticas**
- Enviar email/SMS 7 días antes del vencimiento
- Enviar alerta cuando se vence

### 2. **Dashboard de pagos**
- Gráfico de pagos del mes
- Lista de vencimientos de la semana
- Total de ingresos del mes

### 3. **Recordatorios manuales**
Botón en la tabla para enviar recordatorio:
```tsx
{daysUntilExpiry <= 7 && (
  <button onClick={() => sendReminder(athlete.id)}>
    📧 Recordar
  </button>
)}
```

### 4. **Filtros avanzados**
```tsx
// En la página de atletas
const [paymentFilter, setPaymentFilter] = useState("all");

// Filtrar antes de mostrar
const filteredAthletes = athletes.filter((a) => {
  const lastPayment = getLastApprovedPayment(a.payments);
  const days = lastPayment ? getDaysUntilExpiry(lastPayment.periodEnd) : null;
  
  switch (paymentFilter) {
    case "overdue": return days !== null && days < 0;
    case "expiring": return days !== null && days >= 0 && days <= 7;
    case "current": return days !== null && days > 7;
    case "none": return !lastPayment;
    default: return true;
  }
});
```

### 5. **Exportar lista de vencimientos**
```tsx
<button onClick={exportOverdueAthletes}>
  Exportar vencidos a Excel
</button>
```

---

## 🧪 Testing

### Casos de prueba

```typescript
describe("Payment Status Badge", () => {
  it("muestra 'Sin pagos' cuando no hay pagos", () => {
    const athlete = { payments: [] };
    // Verificar badge rojo
  });

  it("muestra 'Vencido' cuando periodEnd < hoy", () => {
    const athlete = {
      payments: [
        { status: "APPROVED", periodEnd: "2025-10-15" }
      ]
    };
    // Hoy = 2025-10-20
    // Verificar badge rojo + "Hace 5 días"
  });

  it("muestra 'Por vencer' cuando faltan <= 7 días", () => {
    const athlete = {
      payments: [
        { status: "APPROVED", periodEnd: "2025-10-23" }
      ]
    };
    // Hoy = 2025-10-20
    // Verificar badge amarillo + "Faltan 3 días"
  });

  it("muestra 'Al día' cuando faltan > 7 días", () => {
    const athlete = {
      payments: [
        { status: "APPROVED", periodEnd: "2025-11-05" }
      ]
    };
    // Hoy = 2025-10-20
    // Verificar badge verde + "Faltan 15 días"
  });

  it("ignora pagos no aprobados", () => {
    const athlete = {
      payments: [
        { status: "PENDING", periodEnd: "2025-11-30" },
        { status: "APPROVED", periodEnd: "2025-10-31" }
      ]
    };
    // Debe usar el del 31/10, no el del 30/11
  });

  it("usa el pago más reciente cuando hay varios", () => {
    const athlete = {
      payments: [
        { status: "APPROVED", periodEnd: "2025-09-30" },
        { status: "APPROVED", periodEnd: "2025-10-31" }
      ]
    };
    // Debe usar el del 31/10
  });
});
```

---

## 📊 Impacto visual

### Antes
```
┌────────────┬──────┬─────────┬────────┬──────┬───────┬──────────┐
│ Atleta     │ Edad │ Contact │ Estado │ WODs │ Pagos │ Acciones │
├────────────┼──────┼─────────┼────────┼──────┼───────┼──────────┤
│ Juan Pérez │ 28   │ +549... │ Activo │  12  │   5   │ 👁️✏️🗑️   │
└────────────┴──────┴─────────┴────────┴──────┴───────┴──────────┘
```

### Después
```
┌────────────┬──────┬─────────┬────────┬────────────────┬──────┬──────────┐
│ Atleta     │ Edad │ Contact │ Estado │ Estado de Pago │ WODs │ Acciones │
├────────────┼──────┼─────────┼────────┼────────────────┼──────┼──────────┤
│ Juan Pérez │ 28   │ +549... │ Activo │ 🟢 Al día      │  12  │ 👁️✏️🗑️   │
│            │      │         │        │ Faltan 15 días │      │          │
│            │      │         │        │ Vence: 05/11   │      │          │
└────────────┴──────┴─────────┴────────┴────────────────┴──────┴──────────┘
```

**Cambios**:
- ✅ Columna "Pagos" (cantidad) → "Estado de Pago" (info detallada)
- ✅ Badge visual con color
- ✅ Días hasta vencimiento
- ✅ Fecha de vencimiento

---

## 🎨 Personalización

### Cambiar umbrales de días

```typescript
// Actualmente: 7 días para "Por vencer"
// Cambiar a 10 días:
if (daysUntilExpiry <= 10) {  // Era 7
  return <Badge color="warning">Por vencer</Badge>;
}
```

### Cambiar textos

```typescript
const labels = {
  none: "Sin pagos",
  overdue: "Vencido",
  expiring: "Por vencer",
  current: "Al día",
};
```

### Agregar más estados

```typescript
// Ejemplo: "Próximo a vencer" (entre 7 y 14 días)
if (daysUntilExpiry > 7 && daysUntilExpiry <= 14) {
  return <Badge color="info">Próximo a vencer</Badge>;
}
```

---

**✅ Funcionalidad implementada y lista para usar!**

Los entrenadores ahora pueden ver de un vistazo el estado de pagos de todos los atletas. 🎉
