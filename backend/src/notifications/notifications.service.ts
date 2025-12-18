import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  // Ejecutar todos los días a las 9:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkExpiringPayments() {
    this.logger.log('🔔 Verificando pagos próximos a vencer...');

    const daysBeforeExpiration = 3; // Notificar 3 días antes
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysBeforeExpiration);

    // Buscar pagos activos que vencen en 3 días
    const expiringPayments = await this.prisma.payment.findMany({
      where: {
        status: 'APPROVED',
        periodEnd: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lte: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        athlete: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(
      `📊 Encontrados ${expiringPayments.length} pagos próximos a vencer`,
    );

    // Enviar notificaciones
    for (const payment of expiringPayments) {
      await this.sendExpirationNotification(payment);
    }

    return {
      checked: expiringPayments.length,
      date: targetDate,
    };
  }

  // Enviar notificación de vencimiento
  async sendExpirationNotification(payment: any) {
    const athleteName = payment.athlete.fullName;
    const email = payment.athlete.user.email;
    const phone = payment.athlete.user.phone;
    const expirationDate = new Date(payment.periodEnd).toLocaleDateString(
      'es-AR',
    );
    const activityType = payment.activityType || 'tu membresía';

    this.logger.log(
      `📧 Enviando notificación a ${athleteName} (${email}) - Vence: ${expirationDate}`,
    );

    // TODO: Integrar con servicio de email (NodeMailer, SendGrid, etc.)
    // TODO: Integrar con WhatsApp API
    // TODO: Integrar con SMS

    // Por ahora solo registramos en consola
    const message = `
🔔 RECORDATORIO DE VENCIMIENTO

Hola ${athleteName},

Tu pago de ${activityType} vence el ${expirationDate}.

Monto: $${payment.amount / 100}
${payment.quantity && payment.pricePerUnit ? `Cantidad: ${payment.quantity} × $${payment.pricePerUnit / 100}` : ''}

Por favor, renueva tu cuota antes del vencimiento.

¡Gracias!
    `.trim();

    console.log(message);
    console.log(`📱 Email: ${email}`);
    if (phone) console.log(`📱 WhatsApp/SMS: ${phone}`);
    console.log('---');

    return {
      sent: true,
      athleteId: payment.athleteId,
      email,
      phone,
    };
  }

  // Método manual para probar notificaciones
  async checkExpiringPaymentsManual(daysBeforeExpiration = 3) {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysBeforeExpiration);

    const expiringPayments = await this.prisma.payment.findMany({
      where: {
        status: 'APPROVED',
        periodEnd: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lte: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        athlete: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    const notifications: Array<{
      sent: boolean;
      athleteId: string;
      email: string;
      phone: string | null;
    }> = [];
    for (const payment of expiringPayments) {
      const result = await this.sendExpirationNotification(payment);
      notifications.push(result);
    }

    return {
      found: expiringPayments.length,
      notifications,
      targetDate,
    };
  }

  // Buscar pagos vencidos (ya pasó la fecha)
  async checkExpiredPayments() {
    const today = new Date();

    const expiredPayments = await this.prisma.payment.findMany({
      where: {
        status: 'APPROVED',
        periodEnd: {
          lt: today,
        },
      },
      include: {
        athlete: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    this.logger.warn(`⚠️ ${expiredPayments.length} pagos vencidos encontrados`);

    return expiredPayments;
  }
}
