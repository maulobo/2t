# 🔔 Sistema de Notificaciones de Vencimiento

## 📋 Descripción

Sistema automático que notifica a los atletas cuando sus cuotas están próximas a vencer (por defecto 3 días antes).

## ⚙️ Características

- ✅ **CRON Job automático**: Se ejecuta diariamente a las 9:00 AM
- ✅ **Configurable**: Puedes cambiar los días de anticipación
- ✅ **Verificación manual**: Endpoints para probar sin esperar al cron
- ✅ **Pagos vencidos**: Detecta pagos que ya expiraron
- ✅ **Información completa**: Email, teléfono, monto, actividad

## 🚀 Uso

### Automático (CRON)

El sistema se ejecuta automáticamente todos los días a las 9:00 AM.

```typescript
@Cron(CronExpression.EVERY_DAY_AT_9AM)
async checkExpiringPayments() {
  // Busca pagos que vencen en 3 días
  // Envía notificaciones automáticamente
}
```

### Manual (Endpoints)

#### Verificar pagos próximos a vencer

```bash
GET /notifications/check-expiring?days=3
```

**Ejemplo:**

```bash
curl http://localhost:3000/notifications/check-expiring?days=3
```

**Respuesta:**

```json
{
  "found": 2,
  "notifications": [
    {
      "sent": true,
      "athleteId": "clxxx",
      "email": "atleta@example.com",
      "phone": "+5491112345678"
    }
  ],
  "targetDate": "2025-10-25T00:00:00.000Z"
}
```

#### Ver pagos vencidos

```bash
GET /notifications/check-expired
```

## 📝 Formato del Mensaje

```
🔔 RECORDATORIO DE VENCIMIENTO

Hola Juan Pérez,

Tu pago de CROSSFIT vence el 25/10/2025.

Monto: $50000
Cantidad: 3 × $10000

Por favor, renueva tu cuota antes del vencimiento.

¡Gracias!
```

## 🔧 Configuración

### Cambiar horario del CRON

En `notifications.service.ts`:

```typescript
// Opciones disponibles:
@Cron(CronExpression.EVERY_DAY_AT_9AM)      // 9:00 AM diario
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // 00:00 diario
@Cron(CronExpression.EVERY_HOUR)            // Cada hora
@Cron('0 9 * * *')                          // Custom: 9:00 AM
@Cron('0 9,18 * * *')                       // 9:00 AM y 6:00 PM
```

### Cambiar días de anticipación

```typescript
const daysBeforeExpiration = 3; // Cambiar a 5, 7, etc.
```

## 📧 Integración con Servicios de Mensajería

### Email (NodeMailer)

```bash
pnpm add nodemailer @types/nodemailer
```

```typescript
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

await transporter.sendMail({
  from: 'gym@example.com',
  to: email,
  subject: '🔔 Tu cuota vence pronto',
  text: message,
  html: `<p>${message}</p>`,
});
```

### WhatsApp (Twilio)

```bash
pnpm add twilio
```

```typescript
import { Twilio } from 'twilio';

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

await client.messages.create({
  from: 'whatsapp:+14155238886',
  to: `whatsapp:${phone}`,
  body: message,
});
```

### SMS (Twilio)

```typescript
await client.messages.create({
  from: process.env.TWILIO_PHONE,
  to: phone,
  body: message,
});
```

### Push Notifications (Firebase)

```bash
pnpm add firebase-admin
```

```typescript
import * as admin from 'firebase-admin';

await admin.messaging().send({
  token: deviceToken,
  notification: {
    title: '🔔 Tu cuota vence pronto',
    body: `Hola ${athleteName}, tu cuota vence el ${expirationDate}`,
  },
});
```

## 🧪 Testing

Ejecutar script de prueba:

```bash
node test-notifications.js
```

Esto creará:

1. Un coach
2. Un atleta con email y teléfono
3. Pagos que vencen en 3 y 7 días
4. Ejecutará la verificación manual

## 📊 Logs

El sistema registra en consola:

```
🔔 Verificando pagos próximos a vencer...
📊 Encontrados 2 pagos próximos a vencer
📧 Enviando notificación a Juan Pérez (juan@example.com) - Vence: 25/10/2025
📱 Email: juan@example.com
📱 WhatsApp/SMS: +5491112345678
```

## 🔐 Variables de Entorno

Agregar a `.env`:

```env
# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio (WhatsApp/SMS)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE=+1234567890

# Firebase (Push)
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=xxxxx
```

## 📈 Próximas Mejoras

- [ ] Dashboard de notificaciones enviadas
- [ ] Historial de notificaciones por atleta
- [ ] Múltiples recordatorios (7, 3, 1 día antes)
- [ ] Templates personalizables por actividad
- [ ] Preferencias de notificación por atleta
- [ ] Rate limiting para evitar spam
- [ ] Retry logic para notificaciones fallidas
- [ ] Métricas: tasa de apertura, renovación

## 🎯 Estado Actual

✅ Sistema funcionando en modo **LOG ONLY**  
⚠️ Para producción, integrar servicio de mensajería (email, WhatsApp, SMS, push)

El sistema está preparado para integrar cualquier servicio de mensajería modificando el método `sendExpirationNotification()`.
