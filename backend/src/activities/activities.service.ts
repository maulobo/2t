import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear una nueva actividad
   */
  async create(data: {
    name: string;
    description?: string;
    price?: number;
    color?: string;
    icon?: string;
    active?: boolean;
  }) {
    // Verificar que no exista ya una actividad con ese nombre
    const existing = await this.prisma.activity.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una actividad con el nombre "${data.name}"`,
      );
    }

    return this.prisma.activity.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        color: data.color,
        icon: data.icon,
        active: data.active ?? true,
      },
    });
  }

  /**
   * Listar todas las actividades
   */
  async findAll(includeInactive: boolean = false) {
    return this.prisma.activity.findMany({
      where: includeInactive ? undefined : { active: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            athleteActivities: true,
            trainings: true,
            payments: true,
          },
        },
      },
    });
  }

  /**
   * Obtener una actividad por ID
   */
  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        athleteActivities: {
          where: { isActive: true },
          include: {
            athlete: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            trainings: true,
            payments: true,
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Actividad no encontrada');
    }

    return activity;
  }

  /**
   * Actualizar una actividad
   */
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      color?: string;
      icon?: string;
      active?: boolean;
    },
  ) {
    // Verificar que existe
    await this.findOne(id);

    // Si cambia el nombre, verificar que no exista otro con ese nombre
    if (data.name) {
      const existing = await this.prisma.activity.findUnique({
        where: { name: data.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe otra actividad con el nombre "${data.name}"`,
        );
      }
    }

    return this.prisma.activity.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar una actividad (soft delete - marcar como inactiva)
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.activity.update({
      where: { id },
      data: { active: false },
    });
  }

  /**
   * Obtener actividades de un atleta
   */
  async getAthleteActivities(athleteId: string, onlyActive: boolean = true) {
    const now = new Date();
    return this.prisma.athleteActivity.findMany({
      where: {
        athleteId,
        ...(onlyActive
          ? {
              isActive: true,
              OR: [{ endDate: null }, { endDate: { gte: now } }],
            }
          : {}),
      },
      include: {
        activity: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Asignar actividad a un atleta
   */
  async assignToAthlete(data: {
    athleteId: string;
    activityId: string;
    startDate?: Date;
    notes?: string;
  }) {
    // Verificar que la actividad existe
    await this.findOne(data.activityId);

    // Verificar que el atleta existe
    const athlete = await this.prisma.athleteProfile.findUnique({
      where: { id: data.athleteId },
    });

    if (!athlete) {
      throw new NotFoundException('Atleta no encontrado');
    }

    // Verificar si ya tiene esta actividad activa
    const existing = await this.prisma.athleteActivity.findFirst({
      where: {
        athleteId: data.athleteId,
        activityId: data.activityId,
        isActive: true,
      },
    });

    if (existing) {
      throw new ConflictException('El atleta ya tiene esta actividad activa');
    }

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
        athlete: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  /**
   * Desactivar actividad de un atleta
   */
  async deactivateAthleteActivity(athleteActivityId: string) {
    const athleteActivity = await this.prisma.athleteActivity.findUnique({
      where: { id: athleteActivityId },
      include: {
        activity: true,
        athlete: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!athleteActivity) {
      throw new NotFoundException('Asignación de actividad no encontrada');
    }

    return this.prisma.athleteActivity.update({
      where: { id: athleteActivityId },
      data: {
        isActive: false,
        endDate: new Date(),
      },
      include: {
        activity: true,
        athlete: {
          select: {
            fullName: true,
          },
        },
      },
    });
  }
}
