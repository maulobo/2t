import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AthleteActivitiesService {
  constructor(private prisma: PrismaService) {}

  // Obtener todas las actividades de un atleta (historial completo)
  async findByAthlete(athleteId: string) {
    return this.prisma.athleteActivity.findMany({
      where: { athleteId },
      orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
    });
  }

  // Obtener solo las actividades activas de un atleta
  async findActiveByAthlete(athleteId: string) {
    return this.prisma.athleteActivity.findMany({
      where: {
        athleteId,
        isActive: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  // Agregar una nueva actividad a un atleta
  async createActivity(data: {
    athleteId: string;
    activityId: string;
    startDate?: Date;
    notes?: string;
  }) {
    return this.prisma.athleteActivity.create({
      data: {
        athleteId: data.athleteId,
        activityId: data.activityId,
        startDate: data.startDate || new Date(),
        notes: data.notes,
        isActive: true,
      },
      include: {
        activity: true,
      },
    });
  }

  // Finalizar una actividad (marcar como inactiva)
  async endActivity(id: string, endDate?: Date) {
    return this.prisma.athleteActivity.update({
      where: { id },
      data: {
        isActive: false,
        endDate: endDate || new Date(),
      },
    });
  }

  // Reactivar una actividad (útil si se dio de baja por error)
  async reactivateActivity(id: string) {
    return this.prisma.athleteActivity.update({
      where: { id },
      data: {
        isActive: true,
        endDate: null,
      },
    });
  }

  // Actualizar notas de una actividad
  async updateNotes(id: string, notes: string) {
    return this.prisma.athleteActivity.update({
      where: { id },
      data: { notes },
    });
  }

  // Eliminar una actividad del historial
  async remove(id: string) {
    return this.prisma.athleteActivity.delete({
      where: { id },
    });
  }

  // Obtener estadísticas: cuántos atletas practican cada actividad
  async getActivityStats() {
    const stats = await this.prisma.athleteActivity.groupBy({
      by: ['activityId'],
      where: { isActive: true },
      _count: {
        id: true,
      },
    });

    return stats.map((stat) => ({
      activityId: stat.activityId,
      activeAthletes: stat._count?.id || 0,
    }));
  }
}
