import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // Crear un nuevo pago
  async create(data: {
    athleteId: string;
    amount: number; // en pesos (se convierte a centavos internamente)
    periodStart: Date;
    periodEnd: Date;
    evidenceUrl?: string;
    evidenceText?: string;
    activityId?: string;
  }) {
    return this.prisma.payment.create({
      data: {
        athleteId: data.athleteId,
        amount: Math.round(data.amount * 100), // convertir a centavos
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        status: 'PENDING',
        evidenceUrl: data.evidenceUrl,
        evidenceText: data.evidenceText,
        activityId: data.activityId,
      },
      include: {
        activity: true, // Incluir detalles de la actividad
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
  }

  // Listar pagos de un atleta
  async findByAthlete(athleteId: string) {
    return this.prisma.payment.findMany({
      where: { athleteId },
      orderBy: { createdAt: 'desc' },
      include: {
        activity: true, // Incluir detalles de la actividad
        athlete: {
          select: {
            fullName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // Listar todos los pagos pendientes (para el admin/coach)
  async findPending(coachId?: string) {
    return this.prisma.payment.findMany({
      where: {
        status: 'PENDING',
        ...(coachId && {
          athlete: {
            coachId,
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        activity: true, // Incluir detalles de la actividad
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
  }

  // Aprobar un pago
  async approve(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Actualizar estado del pago
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
        },
      });

      // 2. Si el pago tiene una actividad asociada, gestionar AthleteActivity
      if (payment.activityId) {
        // El usuario requiere que se habiliten las actividades pagadas.
        // No desactivamos otras actividades, permitiendo múltiples actividades simultáneas.

        // Verificar si ya existe una asignación para esta actividad
        const existingAssignment = await tx.athleteActivity.findFirst({
          where: {
            athleteId: payment.athleteId,
            activityId: payment.activityId,
          },
        });

        if (existingAssignment) {
          // Si ya existe, la activamos y extendemos la fecha
          await tx.athleteActivity.update({
            where: { id: existingAssignment.id },
            data: {
              isActive: true,
              endDate: payment.periodEnd,
            },
          });
        } else {
          // Si no existe, creamos una nueva asignación activa
          await tx.athleteActivity.create({
            data: {
              athleteId: payment.athleteId,
              activityId: payment.activityId,
              startDate: new Date(), // Empieza hoy (o cuando se aprueba)
              endDate: payment.periodEnd,
              isActive: true,
            },
          });
        }
      }

      return updatedPayment;
    });
  }

  // Rechazar un pago
  async reject(id: string) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
    });
  }

  // Actualizar evidencia de pago
  async updateEvidence(id: string, evidenceUrl: string, evidenceText?: string) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        evidenceUrl,
        evidenceText,
      },
    });
  }
}
