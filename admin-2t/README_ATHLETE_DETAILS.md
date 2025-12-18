# 🏃 Vista de Detalles del Atleta

Página completa para visualizar toda la información de un atleta individual.

---

## 📁 Archivo

```
src/app/(admin)/(others-pages)/atletas/[id]/page.tsx
```

---

## 🎯 Funcionalidades

### 1. **Información Personal**
- ✅ Avatar con inicial del nombre
- ✅ Estado (Activo/Inactivo)
- ✅ Email
- ✅ Teléfono
- ✅ Fecha de nacimiento
- ✅ Notas personales
- ✅ Coach asignado
- ✅ Estadísticas (cantidad de pagos y WODs)

### 2. **Historial de Pagos**
- ✅ Tabla con todos los pagos
- ✅ Período (fecha inicio - fecha fin)
- ✅ Monto formateado como moneda argentina (ARS)
- ✅ Estado con badges de colores:
  - 🟡 Pendiente (PENDING)
  - 🟢 Aprobado (APPROVED)
  - 🔴 Rechazado (REJECTED)
- ✅ Fecha de creación
- ✅ Ordenado por fecha descendente

### 3. **WODs Asignados**
- ✅ Lista de WODs asignados al atleta
- ✅ Nombre del WOD
- ✅ Descripción
- ✅ Badge de dificultad:
  - 🔵 Principiante (BEGINNER)
  - 🟣 Intermedio (INTERMEDIATE)
  - 🟠 Avanzado (ADVANCED)
  - 🔴 RX
- ✅ Fecha del WOD
- ✅ Duración en minutos
- ✅ Fecha de asignación
- ✅ Estado de completado (✓ Completado)
- ✅ Notas del assignment

### 4. **Acciones**
- ✅ Botón "Editar Atleta" → `/atletas/[id]/edit`
- ✅ Botón "Volver a Lista" → `/atletas`

---

## 🎨 UI/UX

### Layout Responsive
```
Desktop (lg):
┌─────────────────────────────────────────────────┐
│ Breadcrumb: Home > Atletas > Juan Pérez         │
├──────────────┬──────────────────────────────────┤
│              │                                   │
│  Información │  Historial de Pagos              │
│  Personal    │                                   │
│              ├───────────────────────────────────┤
│  (1 columna) │  WODs Asignados                  │
│              │                                   │
│              │  (2 columnas)                     │
└──────────────┴──────────────────────────────────┘

Mobile:
┌─────────────────┐
│ Breadcrumb      │
├─────────────────┤
│ Información     │
│ Personal        │
├─────────────────┤
│ Historial       │
│ de Pagos        │
├─────────────────┤
│ WODs            │
│ Asignados       │
└─────────────────┘
```

---

## 📊 Estados de la UI

### 1. **Loading**
```tsx
<div className="flex h-screen items-center justify-center">
  <div className="text-center">
    <div className="spinner"></div>
    <p>Cargando atleta...</p>
  </div>
</div>
```

### 2. **Error**
```tsx
<div className="flex h-screen items-center justify-center">
  <div className="text-center">
    <p className="text-red-600">Error al cargar el atleta</p>
    <p>{error.message}</p>
    <button>Volver a Atletas</button>
  </div>
</div>
```

### 3. **Atleta no encontrado**
```tsx
<div className="flex h-screen items-center justify-center">
  <div className="text-center">
    <p>Atleta no encontrado</p>
    <button>Volver a Atletas</button>
  </div>
</div>
```

### 4. **Datos cargados**
- Muestra toda la información del atleta
- Pagos ordenados por fecha descendente
- WODs con toda la metadata

---

## 🔧 Uso del SDK

### Hook useAthlete

```typescript
import { useAthlete } from "@/lib/api/hooks/useAthletes";

const { data: athlete, isLoading, error } = useAthlete(athleteId);
```

### Respuesta del backend

```typescript
{
  id: "cmgv8jon800049kik6lxxkrqq",
  userId: "cmgv8jon800029kik8vgfot9b",
  fullName: "Juan Pérez",
  birthDate: "1995-03-15T00:00:00.000Z",
  notes: "Atleta de ejemplo",
  active: true,
  coachId: "cmgv8jomi00009kikv9i2os3z",
  user: {
    email: "atleta@gym.com",
    phone: "+5491100000001"
  },
  payments: [
    {
      id: "cmgv8r18m00059kkpcqn2j899",
      athleteId: "cmgv8jon800049kik6lxxkrqq",
      amount: 8000000, // en centavos
      periodStart: "2025-10-01T00:00:00.000Z",
      periodEnd: "2025-10-31T00:00:00.000Z",
      status: "APPROVED",
      createdAt: "2025-10-17T19:27:57.190Z",
      approvedAt: "2025-10-17T19:28:03.402Z",
      evidenceUrl: null,
      evidenceText: "Pago octubre 2025 - Transferencia"
    }
  ],
  assignments: [
    {
      id: "assignment-1",
      athleteId: "cmgv8jon800049kik6lxxkrqq",
      wodId: "wod-1",
      assignedAt: "2025-10-15T10:00:00.000Z",
      completedAt: "2025-10-15T11:30:00.000Z",
      notes: "Buen tiempo!",
      wod: {
        id: "wod-1",
        name: "Murph",
        description: "Hero WOD",
        date: "2025-10-15T00:00:00.000Z",
        duration: 45,
        difficulty: "RX",
        exercises: "[...]",
        createdAt: "2025-10-01T00:00:00.000Z"
      }
    }
  ],
  coach: {
    user: {
      email: "coach@gym.com"
    }
  },
  _count: {
    payments: 1,
    assignments: 1
  }
}
```

---

## 🎨 Helpers de Formateo

### 1. **Formatear Moneda**
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount / 100); // Convertir de centavos a pesos
};

// Ejemplo:
formatCurrency(8000000) // "$80.000,00"
```

### 2. **Formatear Fecha**
```typescript
import { format } from "date-fns";
import { es } from "date-fns/locale";

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
};

// Ejemplo:
formatDate("2025-10-01T00:00:00.000Z") // "01/10/2025"
```

### 3. **Badge de Estado de Pago**
```typescript
const getStatusBadge = (status: string) => {
  const badges = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  const labels = {
    PENDING: "Pendiente",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badges[status]}`}>
      {labels[status]}
    </span>
  );
};
```

### 4. **Badge de Dificultad de WOD**
```typescript
const getDifficultyBadge = (difficulty: string) => {
  const badges = {
    BEGINNER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    INTERMEDIATE: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    ADVANCED: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    RX: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  const labels = {
    BEGINNER: "Principiante",
    INTERMEDIATE: "Intermedio",
    ADVANCED: "Avanzado",
    RX: "RX",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badges[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
};
```

---

## 🔗 Navegación

### Desde la lista de atletas
```typescript
// src/app/(admin)/(others-pages)/atletas/page.tsx
const handleViewDetails = (athleteId: string) => {
  router.push(`/atletas/${athleteId}`);
};
```

### Hacia edición
```typescript
// src/app/(admin)/(others-pages)/atletas/[id]/page.tsx
<button onClick={() => router.push(`/atletas/${athlete.id}/edit`)}>
  Editar Atleta
</button>
```

### Volver a la lista
```typescript
<button onClick={() => router.push("/atletas")}>
  Volver a Lista
</button>
```

---

## 🎯 Características de Dark Mode

Todos los componentes tienen soporte completo para dark mode:

```tsx
// Textos
className="text-gray-900 dark:text-white"

// Backgrounds
className="bg-gray-50 dark:bg-gray-800"

// Borders
className="border-gray-300 dark:border-gray-700"

// Badges
className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"

// Hover states
className="hover:bg-gray-50 dark:hover:bg-gray-800"
```

---

## 📦 Dependencias

```json
{
  "date-fns": "^4.1.0",
  "@tanstack/react-query": "^5.90.5"
}
```

### Instalar dependencias
```bash
pnpm install date-fns
```

---

## 🚀 Próximas mejoras

### 1. **Gráficos de progreso**
- Gráfico de pagos por mes
- Gráfico de WODs completados vs asignados
- Timeline de actividad

### 2. **Acciones rápidas**
- Registrar nuevo pago
- Asignar nuevo WOD
- Enviar notificación al atleta

### 3. **Exportar datos**
- Exportar historial de pagos a PDF
- Exportar WODs completados a Excel

### 4. **Más información**
- PRs personales (Personal Records)
- Mediciones corporales
- Fotos de progreso
- Asistencias

---

## 🧪 Testing

### Casos de prueba

```typescript
// 1. Atleta con todos los datos
✅ Muestra información completa
✅ Muestra todos los pagos
✅ Muestra todos los WODs

// 2. Atleta sin pagos
✅ Muestra mensaje "No hay pagos registrados"

// 3. Atleta sin WODs
✅ Muestra mensaje "No hay WODs asignados"

// 4. Atleta inactivo
✅ Badge "Inactivo" en gris

// 5. Atleta con WODs completados
✅ Badge verde "✓ Completado"

// 6. Error al cargar
✅ Muestra mensaje de error
✅ Botón para volver

// 7. Atleta no encontrado
✅ Muestra mensaje "Atleta no encontrado"
✅ Botón para volver
```

---

## 🎨 Personalización

### Cambiar colores de badges

```typescript
// En getStatusBadge()
const badges = {
  PENDING: "tu-clase-personalizada",
  APPROVED: "tu-clase-personalizada",
  REJECTED: "tu-clase-personalizada",
};
```

### Cambiar formato de moneda

```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP", // Cambiar a tu moneda
  }).format(amount / 100);
};
```

### Cambiar formato de fecha

```typescript
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "MM/dd/yyyy"); // Formato USA
};
```

---

## 📚 Recursos

- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [date-fns Documentation](https://date-fns.org/docs/Getting-Started)
- [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)

---

**¡Vista de detalles completa y lista para usar! 🎉**
