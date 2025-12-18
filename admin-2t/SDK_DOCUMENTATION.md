# 🚀 SDK API - Documentación

## Arquitectura implementada

Se ha implementado un SDK completo para comunicación con el backend NestJS usando React Query.

---

## 📁 Estructura de archivos

```
src/lib/api/
├── client.ts                    # Cliente HTTP base (fetch wrapper)
├── athletes.ts                  # SDK específico para atletas
└── hooks/
    └── useAthletes.ts          # Hooks personalizados con React Query

src/providers/
└── QueryProvider.tsx           # Provider de React Query

src/app/layout.tsx              # Layout con QueryProvider
```

---

## 🎯 Capas de la arquitectura

### 1. **API Client (`client.ts`)**

Cliente HTTP genérico que maneja todas las peticiones:

```typescript
import { apiClient } from '@/lib/api/client';

// Métodos disponibles
apiClient.get<T>(endpoint, config);
apiClient.post<T>(endpoint, body, config);
apiClient.put<T>(endpoint, body, config);
apiClient.patch<T>(endpoint, body, config);
apiClient.delete<T>(endpoint, config);

// Helper para query strings
apiClient.buildQueryString(params);
```

**Features:**
- ✅ Manejo centralizado de errores
- ✅ Headers automáticos
- ✅ Tipado fuerte con TypeScript
- ✅ Soporte para caché de Next.js
- ✅ Custom ApiError class

---

### 2. **Athletes API (`athletes.ts`)**

SDK específico para el módulo de atletas:

```typescript
import { athletesApi } from '@/lib/api/athletes';

// Métodos disponibles
await athletesApi.getAll(params);          // GET /athletes
await athletesApi.getById(id);             // GET /athletes/:id
await athletesApi.create(data);            // POST /athletes
await athletesApi.update(id, data);        // PATCH /athletes/:id
await athletesApi.delete(id);              // DELETE /athletes/:id
await athletesApi.toggleActive(id, active); // PATCH /athletes/:id
await athletesApi.getByCoach(coachId);     // GET /athletes?coachId=...
```

**Interfaces:**
```typescript
interface AthleteListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  coachId?: string;
}

interface CreateAthleteDto {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
  notes?: string;
  coachId: string;
}

interface UpdateAthleteDto {
  fullName?: string;
  phone?: string;
  birthDate?: string;
  notes?: string;
  active?: boolean;
}
```

---

### 3. **React Query Hooks (`hooks/useAthletes.ts`)**

Hooks personalizados para Client Components:

```typescript
import { 
  useAthletes, 
  useAthlete, 
  useCreateAthlete,
  useUpdateAthlete,
  useDeleteAthlete,
  useToggleAthleteActive 
} from '@/lib/api/hooks/useAthletes';
```

#### **useAthletes** - Listar atletas

```typescript
const { data, isLoading, error, refetch } = useAthletes({
  page: 1,
  pageSize: 10,
  search: "Juan",
  active: true,
});

// data.athletes - Array de atletas
// data.total - Total de atletas
// data.totalPages - Total de páginas
```

#### **useAthlete** - Obtener un atleta

```typescript
const { data: athlete, isLoading, error } = useAthlete("athlete-id");
```

#### **useCreateAthlete** - Crear atleta

```typescript
const createMutation = useCreateAthlete();

const handleCreate = async () => {
  try {
    await createMutation.mutateAsync({
      fullName: "Juan Pérez",
      email: "juan@example.com",
      password: "password123",
      coachId: "coach-id",
    });
    alert("Atleta creado!");
  } catch (error) {
    alert("Error!");
  }
};
```

#### **useUpdateAthlete** - Actualizar atleta

```typescript
const updateMutation = useUpdateAthlete();

const handleUpdate = async () => {
  await updateMutation.mutateAsync({
    id: "athlete-id",
    data: {
      fullName: "Juan Carlos Pérez",
      active: true,
    },
  });
};
```

#### **useDeleteAthlete** - Eliminar atleta

```typescript
const deleteMutation = useDeleteAthlete();

const handleDelete = async (id: string) => {
  if (confirm("¿Eliminar?")) {
    await deleteMutation.mutateAsync(id);
  }
};
```

#### **useToggleAthleteActive** - Activar/Desactivar

```typescript
const toggleMutation = useToggleAthleteActive();

const handleToggle = async (id: string, active: boolean) => {
  await toggleMutation.mutateAsync({ id, active });
};
```

---

## 🎨 Ejemplo completo: Página de atletas

```typescript
"use client";

import { useState } from "react";
import { useAthletes, useDeleteAthlete } from "@/lib/api/hooks/useAthletes";
import { AthleteListParams } from "@/lib/api/athletes";

export default function AthletesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  
  // Query params
  const params: AthleteListParams = {
    page: currentPage,
    pageSize: 10,
    search,
  };

  // Hooks
  const { data, isLoading, error, refetch } = useAthletes(params);
  const deleteMutation = useDeleteAthlete();

  // Handlers
  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    // El caché se revalida automáticamente!
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar..."
      />
      
      {data?.athletes.map((athlete) => (
        <div key={athlete.id}>
          <h3>{athlete.fullName}</h3>
          <button onClick={() => handleDelete(athlete.id)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 Configuración

### 1. Variables de entorno

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Provider en layout

El `QueryProvider` ya está configurado en `src/app/layout.tsx`:

```typescript
import QueryProvider from '@/providers/QueryProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

## ✨ Ventajas del SDK

### 1. **Caché inteligente**
React Query cachea automáticamente las respuestas:
```typescript
// Primera llamada - hace fetch
const { data } = useAthletes({ page: 1 });

// Segunda llamada - usa caché (no hace fetch)
const { data } = useAthletes({ page: 1 });
```

### 2. **Revalidación automática**
Después de crear/actualizar/eliminar, el caché se invalida automáticamente:
```typescript
// Eliminar un atleta
await deleteMutation.mutateAsync(id);

// ✅ La lista se recarga automáticamente
// No necesitas llamar a refetch() manualmente
```

### 3. **Loading y Error states**
Manejo automático de estados:
```typescript
const { data, isLoading, error, refetch } = useAthletes();

if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} onRetry={refetch} />;
return <Table data={data.athletes} />;
```

### 4. **Optimistic Updates**
Puedes actualizar la UI antes de que responda el servidor:
```typescript
const updateMutation = useUpdateAthlete({
  onMutate: async (newData) => {
    // Actualizar UI inmediatamente
    queryClient.setQueryData(['athletes'], (old) => ({
      ...old,
      athletes: old.athletes.map((a) =>
        a.id === newData.id ? { ...a, ...newData.data } : a
      ),
    }));
  },
});
```

### 5. **DevTools**
React Query DevTools incluido en desarrollo:
- Ver estado del caché
- Ver queries activas
- Invalidar caché manualmente
- Ver errores

Abre tu app y verás el ícono en la esquina inferior:
```
http://localhost:3000
```

---

## 🎯 Patrones de uso

### Pattern 1: Server Component + Client Component

```typescript
// app/athletes/page.tsx (Server Component)
import { athletesApi } from '@/lib/api/athletes';
import AthletesClient from './AthletesClient';

export default async function AthletesPage() {
  // Fetch inicial en el servidor (SSR)
  const initialData = await athletesApi.getAll({ page: 1 });
  
  return <AthletesClient initialData={initialData} />;
}

// app/athletes/AthletesClient.tsx (Client Component)
"use client";

export default function AthletesClient({ initialData }) {
  const { data } = useAthletes(
    { page: 1 },
    { initialData } // Usar datos del servidor
  );
  
  return <Table data={data.athletes} />;
}
```

### Pattern 2: Pure Client Component

```typescript
"use client";

export default function AthletesPage() {
  const { data, isLoading } = useAthletes();
  
  if (isLoading) return <Spinner />;
  return <Table data={data.athletes} />;
}
```

### Pattern 3: Server Actions (para mutations)

```typescript
// app/actions/athletes.ts
"use server";

import { athletesApi } from '@/lib/api/athletes';
import { revalidatePath } from 'next/cache';

export async function createAthlete(formData: FormData) {
  const data = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    // ...
  };
  
  await athletesApi.create(data);
  revalidatePath('/athletes');
}
```

---

## 🔐 Autenticación (próximamente)

Para agregar autenticación, actualiza el `apiClient`:

```typescript
// lib/api/client.ts
class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Agregar método para configurar token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Agregar método para limpiar token
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }
}
```

Uso:
```typescript
// En tu login
import { apiClient } from '@/lib/api/client';

const handleLogin = async () => {
  const response = await fetch('/api/auth/login', { ... });
  const { token } = await response.json();
  
  apiClient.setAuthToken(token);
  localStorage.setItem('token', token);
};
```

---

## 🧪 Testing

### Mock de API Client

```typescript
// __mocks__/api/client.ts
export const apiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};
```

### Mock de React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

test('useAthletes hook', async () => {
  const { result } = renderHook(() => useAthletes(), { wrapper });
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

---

## 📊 Performance

### Configuración de caché

```typescript
// src/providers/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 minuto
      cacheTime: 5 * 60 * 1000,    // 5 minutos
      refetchOnWindowFocus: false,  // No refetch al cambiar de ventana
      retry: 1,                     // Reintentar 1 vez
    },
  },
});
```

### Prefetching

```typescript
const queryClient = useQueryClient();

// Prefetch para siguiente página
const prefetchNextPage = () => {
  queryClient.prefetchQuery({
    queryKey: athletesKeys.list({ page: currentPage + 1 }),
    queryFn: () => athletesApi.getAll({ page: currentPage + 1 }),
  });
};

// Llamar al hacer hover en botón "Siguiente"
<button onMouseEnter={prefetchNextPage}>
  Siguiente página
</button>
```

---

## 🚀 Próximos pasos

1. ✅ SDK básico implementado
2. ✅ React Query configurado
3. ✅ Hooks personalizados creados
4. ⏳ Agregar autenticación
5. ⏳ Agregar más módulos (WODs, Payments, etc.)
6. ⏳ Agregar optimistic updates
7. ⏳ Agregar prefetching
8. ⏳ Agregar tests unitarios

---

## 📚 Referencias

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**¡SDK listo para usar! 🎉**
