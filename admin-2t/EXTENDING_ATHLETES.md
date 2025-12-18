# 🚀 Cómo extender la vista de Atletas

## Guía para agregar nuevas funcionalidades

---

## 1. 📝 Agregar formulario para crear atleta

### Paso 1: Crear el componente del formulario

**Ubicación**: `/src/components/athletes/CreateAthleteForm.tsx`

```typescript
"use client";

import React, { useState } from "react";

interface CreateAthleteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateAthleteForm({ onSuccess, onCancel }: CreateAthleteFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    birthDate: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    
    try {
      const response = await fetch(`${API_URL}/athletes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error al crear atleta");

      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Error al crear el atleta");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contraseña *</label>
        <input
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre completo *</label>
        <input
          type="text"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
        <input
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Teléfono</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full rounded-lg border px-4 py-2"
          placeholder="+5491112345678"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notas</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full rounded-lg border px-4 py-2"
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white"
        >
          Crear Atleta
        </button>
      </div>
    </form>
  );
}
```

### Paso 2: Integrar en la página

En `/src/app/(admin)/(others-pages)/atletas/page.tsx`:

```typescript
// Agregar estado para el modal
const [showCreateModal, setShowCreateModal] = useState(false);

// Modificar el botón "Agregar Atleta"
<button
  onClick={() => setShowCreateModal(true)}
  className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white"
>
  + Agregar Atleta
</button>

// Agregar el modal al final de la página
{showCreateModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold mb-4">Crear Nuevo Atleta</h3>
      <CreateAthleteForm
        onSuccess={() => {
          setShowCreateModal(false);
          fetchAthletes();
        }}
        onCancel={() => setShowCreateModal(false)}
      />
    </div>
  </div>
)}
```

---

## 2. 📄 Crear página de detalles del atleta

### Paso 1: Crear la página dinámica

**Ubicación**: `/src/app/(admin)/(others-pages)/atletas/[id]/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Athlete } from "@/types/athlete";

export default function AthleteDetailsPage() {
  const params = useParams();
  const athleteId = params.id as string;
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  useEffect(() => {
    const fetchAthlete = async () => {
      try {
        const response = await fetch(`${API_URL}/athletes/${athleteId}`);
        const data = await response.json();
        setAthlete(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAthlete();
  }, [athleteId]);

  if (loading) return <div>Cargando...</div>;
  if (!athlete) return <div>Atleta no encontrado</div>;

  return (
    <div>
      <PageBreadcrumb pageTitle={athlete.fullName} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información personal */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium">{athlete.user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Teléfono</dt>
              <dd className="text-sm font-medium">{athlete.user.phone || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Fecha de nacimiento</dt>
              <dd className="text-sm font-medium">
                {athlete.birthDate 
                  ? new Date(athlete.birthDate).toLocaleDateString("es-AR")
                  : "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Estadísticas */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-500">WODs asignados</dt>
              <dd className="text-2xl font-bold">{athlete._count?.assignments || 0}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Pagos realizados</dt>
              <dd className="text-2xl font-bold">{athlete._count?.payments || 0}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Notas */}
      {athlete.notes && (
        <div className="mt-6 rounded-xl border bg-white p-6">
          <h3 className="text-lg font-semibold mb-2">Notas</h3>
          <p className="text-sm text-gray-600">{athlete.notes}</p>
        </div>
      )}
    </div>
  );
}
```

### Paso 2: Conectar desde la tabla

En `AthletesTable.tsx`, actualizar `onViewDetails`:

```typescript
// En page.tsx
import { useRouter } from "next/navigation";

const router = useRouter();

const handleViewDetails = (athleteId: string) => {
  router.push(`/atletas/${athleteId}`);
};
```

---

## 3. 📊 Agregar exportación a CSV

### Agregar función de exportación

En `/src/app/(admin)/(others-pages)/atletas/page.tsx`:

```typescript
const exportToCSV = () => {
  const headers = ["Nombre", "Email", "Teléfono", "Estado", "WODs", "Pagos"];
  
  const rows = athletes.map(athlete => [
    athlete.fullName,
    athlete.user.email,
    athlete.user.phone || "",
    athlete.active ? "Activo" : "Inactivo",
    athlete._count?.assignments || 0,
    athlete._count?.payments || 0,
  ]);

  const csv = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `atletas_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
};

// Agregar botón
<button
  onClick={exportToCSV}
  className="rounded-lg bg-purple-500 px-4 py-2 text-sm text-white"
>
  📥 Exportar CSV
</button>
```

---

## 4. 📈 Agregar gráficos y estadísticas

### Crear componente de estadísticas

**Ubicación**: `/src/components/athletes/AthletesStats.tsx`

```typescript
"use client";

import React from "react";

interface AthletesStatsProps {
  totalAthletes: number;
  activeAthletes: number;
  inactiveAthletes: number;
}

export default function AthletesStats({
  totalAthletes,
  activeAthletes,
  inactiveAthletes,
}: AthletesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="rounded-xl border bg-white p-6">
        <div className="text-sm text-gray-500">Total Atletas</div>
        <div className="text-3xl font-bold mt-2">{totalAthletes}</div>
      </div>

      <div className="rounded-xl border bg-green-50 p-6">
        <div className="text-sm text-green-700">Activos</div>
        <div className="text-3xl font-bold text-green-600 mt-2">
          {activeAthletes}
        </div>
        <div className="text-xs text-green-600 mt-1">
          {((activeAthletes / totalAthletes) * 100).toFixed(1)}%
        </div>
      </div>

      <div className="rounded-xl border bg-red-50 p-6">
        <div className="text-sm text-red-700">Inactivos</div>
        <div className="text-3xl font-bold text-red-600 mt-2">
          {inactiveAthletes}
        </div>
        <div className="text-xs text-red-600 mt-1">
          {((inactiveAthletes / totalAthletes) * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
```

---

## 5. 🔍 Agregar más filtros avanzados

### Ejemplo: Filtro por rango de edad

```typescript
// Agregar estados
const [minAge, setMinAge] = useState<number | null>(null);
const [maxAge, setMaxAge] = useState<number | null>(null);

// Agregar inputs
<div className="flex gap-2">
  <input
    type="number"
    placeholder="Edad mínima"
    value={minAge || ""}
    onChange={(e) => setMinAge(e.target.value ? parseInt(e.target.value) : null)}
    className="w-24 rounded-lg border px-2 py-1 text-sm"
  />
  <input
    type="number"
    placeholder="Edad máxima"
    value={maxAge || ""}
    onChange={(e) => setMaxAge(e.target.value ? parseInt(e.target.value) : null)}
    className="w-24 rounded-lg border px-2 py-1 text-sm"
  />
</div>

// Agregar a params en fetchAthletes
if (minAge) params.append("minAge", minAge.toString());
if (maxAge) params.append("maxAge", maxAge.toString());
```

---

## 6. 🔄 Agregar refresh automático

```typescript
// Agregar auto-refresh cada 30 segundos
useEffect(() => {
  const interval = setInterval(() => {
    fetchAthletes();
  }, 30000); // 30 segundos

  return () => clearInterval(interval);
}, [currentPage, filterActive]);

// Agregar botón manual
<button
  onClick={fetchAthletes}
  className="rounded-lg bg-gray-200 px-4 py-2 text-sm"
  title="Actualizar"
>
  🔄 Actualizar
</button>
```

---

## 7. 🎨 Agregar vista de cards (alternativa a tabla)

```typescript
const [viewMode, setViewMode] = useState<"table" | "cards">("table");

// Toggle de vista
<div className="flex gap-2">
  <button
    onClick={() => setViewMode("table")}
    className={viewMode === "table" ? "bg-blue-500 text-white" : "bg-gray-200"}
  >
    📋 Tabla
  </button>
  <button
    onClick={() => setViewMode("cards")}
    className={viewMode === "cards" ? "bg-blue-500 text-white" : "bg-gray-200"}
  >
    🃏 Cards
  </button>
</div>

// Renderizado condicional
{viewMode === "table" ? (
  <AthletesTable athletes={athletes} />
) : (
  <AthletesCards athletes={athletes} />
)}
```

---

## 📝 Checklist para cada nueva feature

- [ ] Crear el componente
- [ ] Agregar tipos TypeScript si es necesario
- [ ] Implementar el endpoint del backend
- [ ] Agregar manejo de errores
- [ ] Agregar loading states
- [ ] Probar con datos mock primero
- [ ] Documentar en el código
- [ ] Actualizar README si es una feature importante

---

## 🎯 Ideas de features adicionales

1. **Búsqueda avanzada**: Por coach, por rango de fecha de registro
2. **Ordenamiento**: Por nombre, edad, cantidad de WODs, etc.
3. **Bulk actions**: Seleccionar múltiples atletas para acciones masivas
4. **Timeline**: Historial de actividad del atleta
5. **Notificaciones**: Alertas de pagos vencidos
6. **Calendario**: Integración con WODs asignados
7. **Chat**: Sistema de mensajería con atletas
8. **Métricas**: Dashboard con gráficos de progreso
9. **Fotos**: Galería de fotos del atleta
10. **Comparación**: Comparar estadísticas entre atletas

---

**¡Feliz coding! 🚀**
