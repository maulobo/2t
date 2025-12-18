# Arquitectura de API

## 📁 Estructura

```
src/lib/api/
├── index.ts                    # Índice centralizado de exportaciones
├── client.ts                   # Cliente API base (fetch wrapper)
├── athletes.ts                 # SDK de Atletas
├── payments.ts                 # SDK de Pagos
├── wods.ts                     # SDK de WODs
├── fees.ts                     # SDK de Tarifas
├── notifications.ts            # SDK de Notificaciones
├── athlete-metrics.ts          # SDK de Métricas
├── athlete-activities.ts       # SDK de Actividades
└── hooks/
    ├── useAthletes.ts          # React Query hooks para Atletas
    ├── usePayments.ts          # React Query hooks para Pagos
    ├── useWods.ts              # React Query hooks para WODs
    ├── useFees.ts              # React Query hooks para Tarifas
    ├── useNotifications.ts     # React Query hooks para Notificaciones
    ├── useAthleteActivities.ts # React Query hooks para Actividades
    └── useAthletePaymentStatus.ts # Hook personalizado para estado de pago
```

## 🏗️ Capas de Arquitectura

### 1. **Cliente Base (`client.ts`)**
- Wrapper alrededor de `fetch` nativo
- Manejo centralizado de errores
- Headers y configuración global
- Soporte para Server Components y Client Components

```typescript
// ✅ Correcto - usa el cliente base
export const paymentsApi = {
  async getByAthlete(athleteId: string): Promise<Payment[]> {
    return apiClient.get<Payment[]>(`/payments/athlete/${athleteId}`);
  }
}

// ❌ Incorrecto - fetch directo
const response = await fetch('http://localhost:3000/payments/athlete/123');
```

### 2. **SDKs de Módulos (`*.ts`)**
- Un archivo por módulo del backend
- Métodos tipados para cada endpoint
- Documentación de uso (Server Component vs Client Component)
- Configuración de cache/revalidación

**Ejemplo:**
```typescript
export const wodsApi = {
  // Obtener WODs del día
  async getToday(): Promise<WODListResponse> {
    return apiClient.get<WODListResponse>('/wods/today', {
      revalidate: 300, // Cache por 5 minutos
    });
  },

  // Crear un WOD (solo admins)
  async create(data: CreateWODDto): Promise<WOD> {
    return apiClient.post<WOD>('/wods', data);
  },
};
```

### 3. **React Query Hooks (`hooks/*.ts`)**
- Abstracción de lógica de fetching
- Manejo automático de loading/error states
- Cache y sincronización
- Optimistic updates
- Invalidación automática

**Ejemplo:**
```typescript
export function useTodayWods() {
  return useQuery({
    queryKey: wodsKeys.today(),
    queryFn: () => wodsApi.getToday(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
```

### 4. **Hooks Personalizados (Business Logic)**
- Encapsulan lógica de negocio compleja
- Combinan múltiples APIs
- Cálculos y transformaciones
- Estados derivados

**Ejemplo:**
```typescript
export function useAthletePaymentStatus(userId: string) {
  // 1. Obtener athlete por userId
  // 2. Obtener pagos del athlete
  // 3. Filtrar pagos aprobados
  // 4. Calcular días hasta vencimiento
  // 5. Determinar estados (expirado, por vencer)
  
  return { paymentStatus, loading, error };
}
```

## 📝 Buenas Prácticas

### ✅ Hacer

1. **Usar hooks en componentes client:**
```typescript
"use client";
import { useTodayWods } from '@/lib/api/hooks/useWods';

export default function Dashboard() {
  const { data, isLoading, error } = useTodayWods();
  // ...
}
```

2. **Importar desde el índice:**
```typescript
import { wodsApi, useTodayWods } from '@/lib/api';
```

3. **Separar lógica de negocio en hooks personalizados:**
```typescript
// Hook personalizado que encapsula lógica compleja
export function useAthletePaymentStatus(userId: string) {
  // Lógica de negocio aquí
}
```

4. **Tipar todas las respuestas:**
```typescript
async getById(id: string): Promise<WOD> {
  return apiClient.get<WOD>(`/wods/${id}`);
}
```

### ❌ Evitar

1. **Fetch directo en componentes:**
```typescript
// ❌ MAL - lógica mezclada en el componente
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/wods/today')
    .then(res => res.json())
    .then(setData);
}, []);
```

2. **Lógica de negocio en componentes:**
```typescript
// ❌ MAL - cálculos en el componente
const daysUntilDue = Math.ceil(
  (new Date(payment.periodEnd).getTime() - Date.now()) / (1000*60*60*24)
);
```

3. **URLs hardcodeadas:**
```typescript
// ❌ MAL
fetch('http://localhost:3000/api/wods')

// ✅ BIEN
wodsApi.getList()
```

4. **Mezclar axios y fetch:**
```typescript
// ❌ MAL - inconsistencia
const payments = await axios.get('/payments');
const wods = await fetch('/wods/today');

// ✅ BIEN - usar el cliente centralizado
const payments = await paymentsApi.getByAthlete(id);
const wods = await wodsApi.getToday();
```

## 🔄 Flujo de Datos

```
Componente Client
    ↓
React Query Hook (useWods)
    ↓
SDK Module (wodsApi)
    ↓
API Client (apiClient)
    ↓
fetch nativo
    ↓
Backend NestJS
```

## 🎯 Ejemplo Completo

### Antes (❌ Mal estructurado):
```typescript
export default function Dashboard() {
  const [wods, setWods] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/wods/today', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setWods(data.wods);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{wods[0].title}</div>;
}
```

### Después (✅ Bien estructurado):
```typescript
import { useTodayWods } from '@/lib/api';

export default function Dashboard() {
  const { data, isLoading } = useTodayWods();
  
  if (isLoading) return <div>Loading...</div>;
  
  const todayWOD = data?.wods?.[0];
  
  return <div>{todayWOD?.title}</div>;
}
```

## 📚 Referencias

- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
