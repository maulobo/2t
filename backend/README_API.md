# 🏋️ Gym Management API - Resumen para el Frontend

## 📦 Archivos Generados

✅ **API_DOCUMENTATION.md** - Documentación completa de todos los endpoints  
✅ **API_TYPES.ts** - Tipos TypeScript listos para copiar al front  
✅ **API_CLIENT.ts** - Cliente API con funciones listas para usar

---

## 🚀 Quick Start para el Frontend

### 1. Copiar archivos al proyecto

```bash
# Copiar tipos
cp backend/API_TYPES.ts frontend/src/types/api.ts

# Copiar cliente
cp backend/API_CLIENT.ts frontend/src/lib/api.ts
```

### 2. Configurar variables de entorno

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Usar en componentes

```typescript
import { athletesAPI, paymentsAPI } from '@/lib/api';

// Listar atletas
const athletes = await athletesAPI.listByCoach(coachId);

// Crear pago
await paymentsAPI.create({
  athleteId: athlete.id,
  amount: 80000,
  periodStart: '2025-10-01',
  periodEnd: '2025-10-31',
});

// Aprobar pago
await paymentsAPI.approve(paymentId);
```

---

## 📊 Resumen de Endpoints

### 👥 Coaches

- `POST /users/coach` - Crear coach
- `GET /users/coaches` - Listar coaches

### 🏃 Atletas

- `POST /athletes` - Crear atleta
- `GET /athletes/coach/:coachId` - Listar atletas de un coach
- `GET /athletes/:id` - Detalle del atleta
- `PATCH /athletes/:id` - Actualizar atleta
- `GET /athletes/:id/payment-status` - Estado de pago

### 💰 Pagos

- `POST /payments` - Crear pago
- `GET /payments/pending` - Listar pendientes
- `GET /payments/athlete/:athleteId` - Pagos de un atleta
- `PATCH /payments/:id/approve` - Aprobar
- `PATCH /payments/:id/reject` - Rechazar
- `PATCH /payments/:id/evidence` - Subir evidencia

---

## ⚠️ Puntos Importantes

### IDs a usar

- ✅ **athlete.id** → Para pagos, WODs
- ❌ **user.id** → Solo para auth (futuro)

### Montos

- Frontend envía en **pesos**: `80000`
- Backend guarda en **centavos**: `8000000`
- Frontend muestra: `amount / 100`

### Fechas

- Enviar en formato ISO: `"2025-10-01"`
- Backend devuelve ISO: `"2025-10-01T00:00:00.000Z"`

---

## 🎯 Flujos Principales

### Crear Atleta

1. Listar coaches → `GET /users/coaches`
2. Crear atleta → `POST /athletes` (con coachId)
3. Ver perfil → `GET /athletes/:id`

### Gestionar Pagos

1. Ver pendientes → `GET /payments/pending`
2. Revisar evidencia
3. Aprobar → `PATCH /payments/:id/approve`

### Ver Estado de Atleta

1. Obtener estado → `GET /athletes/:id/payment-status`
2. Mostrar badge "Al día" o "Vencido"

---

## 🛠️ Estado Actual

### ✅ Implementado

- [x] CRUD Coaches
- [x] CRUD Atletas
- [x] Sistema de Pagos completo
- [x] Verificación de estado de pago
- [x] Base de datos con Prisma + PostgreSQL
- [x] Docker setup (Postgres + Redis + MinIO)

### 🔜 Próximo (Backend)

- [ ] Autenticación JWT
- [ ] Subida de evidencias (imágenes)
- [ ] CRUD de WODs
- [ ] Notificaciones WhatsApp
- [ ] Reportes y estadísticas

### 🎨 Frontend Pendiente

- [ ] Login/Auth
- [ ] Dashboard de atletas
- [ ] Dashboard de pagos pendientes
- [ ] Formulario crear atleta
- [ ] Verificador de estado de pago
- [ ] Subida de comprobantes

---

## 📝 Credenciales de Testing

```
Coach:
  Email: coach@gym.com
  Password: Coach123!
  ID: cmgv8jomi00009kikv9i2os3z

Atleta (ejemplo):
  Email: atleta@gym.com
  Password: Atleta123!
  AthleteId: cmgv8jon800049kik6lxxkrqq
```

---

## 🔧 Comandos Útiles

### Backend

```bash
# Levantar Docker
cd backend && docker compose -f docker.compose.yml up -d

# Iniciar servidor
pnpm run start:dev

# Seed de datos
pnpm exec ts-node prisma/seed.ts

# Ver DB
pnpm prisma studio
```

### Testing endpoints

```bash
# Crear atleta
curl -X POST http://localhost:3000/athletes \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","fullName":"Test User","coachId":"cmgv8jomi00009kikv9i2os3z"}'

# Ver atletas
curl http://localhost:3000/athletes/coach/cmgv8jomi00009kikv9i2os3z

# Crear pago
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{"athleteId":"cmgv8jon800049kik6lxxkrqq","amount":80000,"periodStart":"2025-10-01","periodEnd":"2025-10-31"}'

# Ver pendientes
curl http://localhost:3000/payments/pending
```

---

## 📚 Documentación Completa

Ver **API_DOCUMENTATION.md** para:

- Especificación completa de cada endpoint
- Request/response examples
- Manejo de errores
- Ejemplos de integración React/Next.js
- Componentes listos para usar

---

## 🐛 Errores Comunes

### Error: "Foreign key constraint violated"

**Causa:** Usar User ID en vez de AthleteProfile ID  
**Solución:** Usar `athlete.id` (no `user.id`)

### Error: "Email already exists"

**Causa:** Email duplicado  
**Solución:** Validar en el front antes de enviar

### Error: "Connection refused"

**Causa:** Backend no está corriendo  
**Solución:** `pnpm run start:dev`

---

## 📞 Contacto

¿Dudas sobre la API? Revisar **API_DOCUMENTATION.md** primero.

**Happy coding! 🚀**
