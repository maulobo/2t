# Sistema de Gestión de Pagos

## 🎯 Características Implementadas

### 1. Crear Pagos
- **Formulario intuitivo** con búsqueda de atletas
- **Auto-aprobación opcional** (checkbox flexible)
- **Selección rápida de período** (mes actual / próximo mes)
- **Evidencia de pago** (texto + URL)
- **Validación completa** de formulario

### 2. Vista de Pagos `/pagos`
- **Panel izquierdo**: Formulario para registrar nuevos pagos
- **Panel derecho**: Lista de pagos pendientes de aprobación
- **Acciones rápidas**: Aprobar/Rechazar con un click
- **Auto-actualización** con React Query

### 3. Integración en Lista de Atletas
- **Columna "Estado de Pago"** con badges visuales:
  - 🟢 **Al día** - Más de 7 días hasta vencimiento
  - 🟡 **Por vencer** - 7 días o menos hasta vencimiento
  - 🔴 **Vencido** - Pago expirado
  - ⚪ **Sin pagos** - No hay pagos aprobados
- **Botón 💵 en cada fila** para crear pago rápidamente
- **Modal emergente** con formulario pre-seleccionado con el atleta

## 📁 Archivos Creados

### SDK y Hooks
```
/src/lib/api/payments.ts                 - API methods (create, approve, reject, etc)
/src/lib/api/hooks/usePayments.ts        - React Query hooks
```

### Componentes
```
/src/components/payments/CreatePaymentForm.tsx  - Formulario de creación
```

### Páginas
```
/src/app/(admin)/(others-pages)/pagos/page.tsx  - Página principal de pagos
```

## 🔧 Uso

### Crear un Pago

**Opción 1: Desde la página de pagos**
1. Ir a `/pagos`
2. Click en "Mostrar" en el panel izquierdo
3. Buscar atleta
4. Completar datos
5. Opcionalmente marcar "Aprobar automáticamente"
6. Enviar

**Opción 2: Desde la lista de atletas**
1. Ir a `/atletas`
2. Click en el botón 💵 del atleta deseado
3. Se abre modal con atleta pre-seleccionado
4. Completar datos
5. Enviar

### Aprobar/Rechazar Pagos Pendientes
1. Ir a `/pagos`
2. Ver lista de pagos pendientes (panel derecho)
3. Click en "✓ Aprobar" o "✗ Rechazar"

## 🎨 Flujo de Aprobación

El sistema implementa un **flujo flexible**:

- **Auto-aprobación** (checkbox en formulario):
  - Si marcado: El pago se crea y se aprueba inmediatamente
  - Si no: El pago queda PENDING para revisión manual

Esta flexibilidad permite:
- Aprobar pagos confiables instantáneamente (ej: transferencia bancaria con comprobante)
- Revisar pagos dudosos manualmente (ej: efectivo sin comprobante)

## 🔄 Cache y Actualización Automática

React Query maneja automáticamente:

- **Invalidación inteligente**:
  - Al crear pago → Invalida lista de atletas y pagos pendientes
  - Al aprobar/rechazar → Invalida pagos del atleta, lista de atletas, pendientes
  
- **Refetch automático**:
  - Lista de pagos pendientes se actualiza cada 30 segundos
  - Queries se revalidan al volver a la ventana (refetchOnWindowFocus)

## 🎯 Próximos Pasos

### Backend
1. Confirmar con el equipo backend el comportamiento de auto-aprobación
2. Configurar CORS en NestJS (ver `CORS_AND_AUTH_SETUP.md`)
3. Verificar que los endpoints coincidan con la SDK

### Frontend (Opcional)
1. Agregar filtros a la lista de pagos pendientes (por fecha, monto, etc)
2. Agregar vista de historial de pagos
3. Agregar estadísticas de pagos
4. Agregar notificaciones de pagos por vencer
5. Agregar exportación de reportes

## 📊 Estructura de Datos

### Payment Interface
```typescript
interface Payment {
  id: string;
  athleteId: string;
  amount: number;        // En centavos (ej: 5000 = $50.00)
  periodStart: string;   // ISO date
  periodEnd: string;     // ISO date
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;     // ISO date
  approvedAt?: string;   // ISO date
  evidenceUrl?: string;  // URL del comprobante
  evidenceText?: string; // Descripción del pago
}
```

### Endpoints Backend Esperados
```
POST   /payments                    - Crear pago
GET    /payments/athlete/:id        - Obtener pagos de un atleta
GET    /payments/pending            - Obtener pagos pendientes
PATCH  /payments/:id/approve        - Aprobar pago
PATCH  /payments/:id/reject         - Rechazar pago
```

## ✅ Checklist de Implementación

- [x] SDK de pagos (`payments.ts`)
- [x] React Query hooks (`usePayments.ts`)
- [x] Formulario de creación (`CreatePaymentForm.tsx`)
- [x] Página de pagos (`/pagos`)
- [x] Integración en lista de atletas
- [x] Modal de creación rápida
- [x] Estado de pago en lista
- [x] Botón de crear pago en tabla
- [x] Auto-aprobación flexible
- [x] Validación de formulario
- [ ] Backend NestJS
- [ ] Tests end-to-end
- [ ] Documentación de API
