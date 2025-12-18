import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService) {}

  // Listar todas las cuotas
  async findAll(coachId?: string) {
    return this.prisma.feeSettings.findMany({
      where: coachId ? { coachId } : {},
      orderBy: { validFrom: 'desc' },
      include: {
        coach: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  // Obtener la cuota vigente actual
  async findCurrent(coachId?: string, activityType?: string) {
    const now = new Date();

    return this.prisma.feeSettings.findFirst({
      where: {
        isActive: true,
        validFrom: { lte: now },
        OR: [{ validUntil: { gte: now } }, { validUntil: null }],
        ...(coachId && { coachId }),
        ...(activityType && { activityType }),
      },
      orderBy: { validFrom: 'desc' },
      include: {
        coach: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  // Obtener una cuota por ID
  async findOne(id: string) {
    return this.prisma.feeSettings.findUnique({
      where: { id },
      include: {
        coach: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  // Crear nueva cuota
  async create(data: {
    amount: number;
    currency?: string;
    activityType: string;
    activityName: string;
    validFrom: Date;
    validUntil?: Date;
    isActive?: boolean;
    description?: string;
    coachId?: string;
  }) {
    return this.prisma.feeSettings.create({
      data: {
        amount: new Decimal(data.amount),
        currency: data.currency || 'ARS',
        activityType: data.activityType,
        activityName: data.activityName,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        isActive: data.isActive ?? false,
        description: data.description,
        coachId: data.coachId,
      },
      include: {
        coach: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  // Actualizar cuota
  async update(
    id: string,
    data: {
      amount?: number;
      currency?: string;
      activityType?: string;
      activityName?: string;
      validFrom?: Date;
      validUntil?: Date;
      isActive?: boolean;
      description?: string;
    },
  ) {
    const updateData: any = { ...data };

    // Convertir amount a Decimal si existe
    if (data.amount !== undefined) {
      updateData.amount = new Decimal(data.amount);
    }

    return this.prisma.feeSettings.update({
      where: { id },
      data: updateData,
      include: {
        coach: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  // Activar una cuota específica (y desactivar las demás del mismo tipo)
  async activate(id: string) {
    // Primero obtener la cuota que se va a activar para saber su activityType
    const feeToActivate = await this.prisma.feeSettings.findUnique({
      where: { id },
    });

    if (!feeToActivate) {
      throw new Error('Cuota no encontrada');
    }

    // Desactivar SOLO las cuotas del mismo activityType y mismo coach
    await this.prisma.feeSettings.updateMany({
      where: {
        isActive: true,
        activityType: feeToActivate.activityType,
        coachId: feeToActivate.coachId,
      },
      data: { isActive: false },
    });

    // Activar la cuota específica
    return this.prisma.feeSettings.update({
      where: { id },
      data: { isActive: true },
      include: {
        coach: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  // Eliminar cuota
  async remove(id: string) {
    return this.prisma.feeSettings.delete({
      where: { id },
    });
  }
}
