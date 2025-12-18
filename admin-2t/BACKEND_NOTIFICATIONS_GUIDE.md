# 🔔 Sistema de Notificaciones de Pagos - Backend

## 📋 Cambios Requeridos en el Backend

### 1. Crear Modelo de Notificaciones

```prisma
// schema.prisma

model Notification {
  id          String   @id @default(cuid())
  athleteId   String
  athlete     AthleteProfile  @relation(fields: [athleteId], references: [id], onDelete: Cascade)
  type        NotificationType
  message     String
  status      NotificationStatus @default(PENDING)
  scheduledFor DateTime
  sentAt      DateTime?
  readAt      DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("notifications")
  @@index([athleteId])
  @@index([status])
  @@index([scheduledFor])
}

enum NotificationType {
  PAYMENT_DUE       // Pago próximo a vencer (3 días antes)
  PAYMENT_OVERDUE   // Pago vencido
  PAYMENT_REMINDER  // Recordatorio adicional
}

enum NotificationStatus {
  PENDING    // Pendiente de envío
  SENT       // Enviada exitosamente
  FAILED     // Fallo en el envío
  CANCELLED  // Cancelada
}
```

### 2. Cron Job - Detectar Pagos Próximos a Vencer

**Frecuencia:** Ejecutar todos los días a las 9:00 AM

```typescript
// src/jobs/check-payments-due.job.ts

import { PrismaClient } from '@prisma/client';
import { addDays, isWithinInterval, isBefore } from 'date-fns';

const prisma = new PrismaClient();

export async function checkPaymentsDue() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const threeDaysFromNow = addDays(today, 3);

  console.log('🔍 Verificando pagos próximos a vencer...');

  // Obtener todos los atletas activos
  const athletes = await prisma.athleteProfile.findMany({
    where: { active: true },
    include: {
      user: true,
      payments: {
        where: { status: 'APPROVED' },
        orderBy: { periodEnd: 'desc' },
        take: 1, // Solo el último pago aprobado
      },
    },
  });

  let notificationsCreated = 0;

  for (const athlete of athletes) {
    const lastPayment = athlete.payments[0];
    
    if (!lastPayment) {
      console.log(`⚠️  ${athlete.fullName}: Sin pagos registrados`);
      continue;
    }

    const paymentEndDate = new Date(lastPayment.periodEnd);
    paymentEndDate.setHours(0, 0, 0, 0);

    // Verificar si el pago vence en los próximos 3 días
    const isDueSoon = isWithinInterval(paymentEndDate, {
      start: today,
      end: threeDaysFromNow,
    });

    // Verificar si ya está vencido
    const isOverdue = isBefore(paymentEndDate, today);

    if (isDueSoon || isOverdue) {
      // Verificar si ya existe una notificación para este período
      const existingNotification = await prisma.notification.findFirst({
        where: {
          athleteId: athlete.id,
          type: isDueSoon ? 'PAYMENT_DUE' : 'PAYMENT_OVERDUE',
          scheduledFor: {
            gte: addDays(today, -7), // Buscar en los últimos 7 días
          },
        },
      });

      if (existingNotification) {
        console.log(`ℹ️  ${athlete.fullName}: Notificación ya existe`);
        continue;
      }

      // Calcular días restantes
      const daysRemaining = Math.ceil(
        (paymentEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Crear mensaje personalizado
      const message = isDueSoon
        ? `Hola ${athlete.fullName}, tu cuota vence en ${daysRemaining} día(s). Por favor realiza tu pago para continuar entrenando sin interrupciones.`
        : `Hola ${athlete.fullName}, tu cuota venció hace ${Math.abs(daysRemaining)} día(s). Por favor ponte al día con tus pagos lo antes posible.`;

      // Crear notificación
      await prisma.notification.create({
        data: {
          athleteId: athlete.id,
          type: isDueSoon ? 'PAYMENT_DUE' : 'PAYMENT_OVERDUE',
          message,
          scheduledFor: today,
        },
      });

      notificationsCreated++;
      console.log(`✅ Notificación creada para ${athlete.fullName} (${isDueSoon ? 'vence pronto' : 'vencido'})`);
    } else {
      console.log(`✓ ${athlete.fullName}: Pago al día`);
    }
  }

  console.log(`\n📊 Resumen: ${notificationsCreated} notificación(es) creada(s)`);
  return { notificationsCreated };
}
```

### 3. Servicio de Envío de Notificaciones

```typescript
// src/services/notification.service.ts

import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Configurar transporter de email
const emailTransporter = nodemailer.createTransport({
  service: 'gmail', // Cambiar según proveedor
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendPendingNotifications() {
  const notifications = await prisma.notification.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: new Date() },
    },
    include: {
      athlete: {
        include: { user: true },
      },
    },
  });

  console.log(`📧 Enviando ${notifications.length} notificación(es)...`);

  for (const notification of notifications) {
    try {
      // Enviar email
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: notification.athlete.user.email,
        subject: '🏋️ Recordatorio de Pago - Tu cuota está por vencer',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">Hola ${notification.athlete.fullName},</h2>
            <p style="font-size: 16px;">${notification.message}</p>
            
            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #ea580c; margin-top: 0;">Formas de Pago:</h3>
              <ul style="line-height: 1.8;">
                <li>💳 Transferencia bancaria</li>
                <li>💰 Mercado Pago</li>
                <li>💵 Efectivo en el gym</li>
              </ul>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">
              Si ya realizaste el pago, por favor ignora este mensaje.
            </p>
            
            <p>¡Gracias por entrenar con nosotros!</p>
          </div>
        `,
      });

      // Marcar como enviada
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      console.log(`✅ Email enviado a ${notification.athlete.fullName}`);
    } catch (error) {
      console.error(`❌ Error enviando a ${notification.athlete.fullName}:`, error);
      
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED' },
      });
    }
  }
}
```

### 4. Configurar Cron Jobs

```typescript
// src/index.ts o src/app.ts

import cron from 'node-cron';
import { checkPaymentsDue } from './jobs/check-payments-due.job';
import { sendPendingNotifications } from './services/notification.service';

// Ejecutar todos los días a las 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('\n⏰ Ejecutando tarea programada: Verificación de pagos');
  try {
    await checkPaymentsDue();
    await sendPendingNotifications();
  } catch (error) {
    console.error('❌ Error en tarea programada:', error);
  }
});

console.log('✅ Cron jobs configurados correctamente');
```

### 5. Endpoints API (Opcional - para el frontend)

```typescript
// src/routes/notifications.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/notifications/athlete/:athleteId
// Obtener notificaciones de un atleta
router.get('/athlete/:athleteId', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { athleteId: req.params.athleteId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

// PATCH /api/notifications/:id/mark-read
// Marcar notificación como leída
router.patch('/:id/mark-read', async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { readAt: new Date() },
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar notificación' });
  }
});

// GET /api/athletes/payment-status
// Obtener atletas con pagos próximos a vencer
router.get('/payment-status', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    const athletes = await prisma.athleteProfile.findMany({
      where: { active: true },
      include: {
        payments: {
          where: { status: 'APPROVED' },
          orderBy: { periodEnd: 'desc' },
          take: 1,
        },
      },
    });
    
    const dueSoon = athletes.filter((athlete) => {
      const lastPayment = athlete.payments[0];
      if (!lastPayment) return false;
      
      const endDate = new Date(lastPayment.periodEnd);
      endDate.setHours(0, 0, 0, 0);
      
      return endDate >= today && endDate <= threeDaysFromNow;
    });
    
    res.json({ dueSoon, count: dueSoon.length });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estado de pagos' });
  }
});

export default router;
```

### 6. Variables de Entorno

```env
# .env

# Email (Gmail example)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# WhatsApp (Twilio) - Opcional
TWILIO_ACCOUNT_SID=tu-account-sid
TWILIO_AUTH_TOKEN=tu-auth-token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
```

### 7. Instalación de Dependencias

```bash
npm install node-cron nodemailer date-fns
npm install --save-dev @types/node-cron @types/nodemailer
```

### 8. Migración de Base de Datos

```bash
npx prisma migrate dev --name add_notifications_table
npx prisma generate
```

## 🧪 Testing

```typescript
// Probar manualmente el job
import { checkPaymentsDue } from './jobs/check-payments-due.job';
import { sendPendingNotifications } from './services/notification.service';

async function testNotifications() {
  console.log('🧪 Testing notifications system...\n');
  
  await checkPaymentsDue();
  await sendPendingNotifications();
  
  console.log('\n✅ Test completed');
}

testNotifications();
```

## 📊 Frontend Ya Implementado

El frontend ya tiene implementado:
- ✅ Widget en el dashboard mostrando pagos próximos a vencer
- ✅ Hook reutilizable `usePaymentsDue()`
- ✅ Estadísticas de vencimientos (vencidos, hoy, próximos)
- ✅ Navegación directa al detalle del atleta
- ✅ Colores por urgencia (rojo = vencido, amarillo = próximo)

## 🚀 Próximos Pasos

1. Implementar el modelo `Notification` en Prisma
2. Crear el cron job `checkPaymentsDue`
3. Crear el servicio de envío de emails
4. Configurar las variables de entorno
5. Probar con datos reales
6. (Opcional) Agregar WhatsApp notifications con Twilio

---

**Nota:** El frontend está listo y funcionando. Solo falta que el backend implemente la lógica de detección y envío automático de notificaciones.
