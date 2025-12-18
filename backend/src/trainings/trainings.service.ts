import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    description: string;
    date: string;
    track?: string;
    videoUrl?: string;
    activityId?: string;
    createdById: string;
  }) {
    return this.prisma.training.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        track: data.track,
        videoUrl: data.videoUrl,
        activityId: data.activityId,
        createdById: data.createdById,
      },
      include: {
        activity: true,
        createdBy: { select: { id: true, email: true, role: true } },
      },
    });
  }

  async createBulk(data: any) {
    const trainingsToCreate = data.trainings.map((training: any) => ({
      title: training.title,
      description: training.description,
      date: new Date(training.date),
      track: training.track,
      videoUrl: training.videoUrl,
      activityId: training.activityId,
      createdById: data.createdById,
    }));

    const result = await this.prisma.training.createMany({
      data: trainingsToCreate,
      skipDuplicates: true,
    });

    return {
      message: `${result.count} entrenamientos creados`,
      count: result.count,
    };
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      date?: string;
      track?: string;
      videoUrl?: string;
      activityId?: string;
    },
  ) {
    return this.prisma.training.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date ? new Date(data.date) : undefined,
        track: data.track,
        videoUrl: data.videoUrl,
        activityId: data.activityId,
      },
      include: {
        activity: true,
        createdBy: { select: { id: true, email: true, role: true } },
      },
    });
  }

  async delete(id: string) {
    await this.prisma.training.delete({ where: { id } });
    return { message: 'Entrenamiento eliminado', id };
  }

  async getToday(activityId?: string, allowedActivityIds?: string[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Si se pide una actividad específica pero no está permitida, retornar vacío
    if (
      activityId &&
      allowedActivityIds &&
      !allowedActivityIds.includes(activityId)
    ) {
      return { date: today.toISOString().split('T')[0], trainings: [] };
    }

    const where: any = {
      date: { gte: today, lt: tomorrow },
    };

    if (activityId) {
      where.activityId = activityId;
    } else if (allowedActivityIds) {
      where.activityId = { in: allowedActivityIds };
    }

    const trainings = await this.prisma.training.findMany({
      where,
      include: {
        activity: true,
        createdBy: { select: { id: true, email: true } },
      },
      orderBy: { date: 'asc' },
    });

    return { date: today.toISOString().split('T')[0], trainings };
  }

  async getByDate(
    dateString: string,
    activityId?: string,
    allowedActivityIds?: string[],
  ) {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    if (
      activityId &&
      allowedActivityIds &&
      !allowedActivityIds.includes(activityId)
    ) {
      return { date: dateString, trainings: [] };
    }

    const where: any = {
      date: { gte: date, lt: nextDay },
    };

    if (activityId) {
      where.activityId = activityId;
    } else if (allowedActivityIds) {
      where.activityId = { in: allowedActivityIds };
    }

    const trainings = await this.prisma.training.findMany({
      where,
      include: {
        activity: true,
        createdBy: { select: { id: true, email: true } },
      },
      orderBy: { date: 'asc' },
    });

    return { date: dateString, trainings };
  }

  async getByMonth(
    year: number,
    month: number,
    activityId?: string,
    allowedActivityIds?: string[],
  ) {
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    if (
      activityId &&
      allowedActivityIds &&
      !allowedActivityIds.includes(activityId)
    ) {
      return { year, month, totalTrainings: 0, trainings: [] };
    }

    const where: any = {
      date: { gte: startDate, lte: endDate },
    };

    if (activityId) {
      where.activityId = activityId;
    } else if (allowedActivityIds) {
      where.activityId = { in: allowedActivityIds };
    }

    const trainings = await this.prisma.training.findMany({
      where,
      include: {
        activity: true,
        createdBy: { select: { id: true, email: true } },
      },
      orderBy: { date: 'asc' },
    });

    return { year, month, totalTrainings: trainings.length, trainings };
  }

  async getByRange(
    start: string,
    end: string,
    activityId?: string,
    allowedActivityIds?: string[],
  ) {
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    if (
      activityId &&
      allowedActivityIds &&
      !allowedActivityIds.includes(activityId)
    ) {
      return {
        startDate: start,
        endDate: end,
        totalTrainings: 0,
        trainings: [],
      };
    }

    const where: any = {
      date: { gte: startDate, lte: endDate },
    };

    if (activityId) {
      where.activityId = activityId;
    } else if (allowedActivityIds) {
      where.activityId = { in: allowedActivityIds };
    }

    const trainings = await this.prisma.training.findMany({
      where,
      include: {
        activity: true,
        createdBy: { select: { id: true, email: true } },
      },
      orderBy: { date: 'asc' },
    });

    return {
      startDate: start,
      endDate: end,
      totalTrainings: trainings.length,
      trainings,
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 30,
    activityId?: string,
    allowedActivityIds?: string[],
  ) {
    const skip = (page - 1) * limit;

    if (
      activityId &&
      allowedActivityIds &&
      !allowedActivityIds.includes(activityId)
    ) {
      return {
        trainings: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const where: any = {};

    if (activityId) {
      where.activityId = activityId;
    } else if (allowedActivityIds) {
      where.activityId = { in: allowedActivityIds };
    }

    const [trainings, total] = await Promise.all([
      this.prisma.training.findMany({
        skip,
        take: limit,
        where,
        include: {
          activity: true,
          createdBy: { select: { id: true, email: true } },
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.training.count({
        where,
      }),
    ]);

    return {
      trainings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const training = await this.prisma.training.findUnique({
      where: { id },
      include: {
        activity: true,
        createdBy: { select: { id: true, email: true } },
        assignments: {
          include: {
            athlete: {
              include: {
                user: { select: { id: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!training) {
      throw new NotFoundException('Entrenamiento no encontrado');
    }

    return training;
  }

  async getHistory(
    limit: number = 20,
    activityId?: string,
    allowedActivityIds?: string[],
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      activityId &&
      allowedActivityIds &&
      !allowedActivityIds.includes(activityId)
    ) {
      return {
        message: 'Entrenamientos históricos',
        totalTrainings: 0,
        trainings: [],
      };
    }

    const where: any = {
      date: { lt: today },
    };

    if (activityId) {
      where.activityId = activityId;
    } else if (allowedActivityIds) {
      where.activityId = { in: allowedActivityIds };
    }

    const trainings = await this.prisma.training.findMany({
      where,
      take: limit,
      include: {
        activity: true,
        createdBy: { select: { id: true, email: true } },
      },
      orderBy: { date: 'desc' },
    });

    return {
      message: 'Entrenamientos históricos',
      totalTrainings: trainings.length,
      trainings,
    };
  }

  async getUpcoming(
    limit: number = 10,
    activityId?: string,
    allowedActivityIds?: string[],
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      activityId &&
      allowedActivityIds &&
      !allowedActivityIds.includes(activityId)
    ) {
      return {
        message: 'Entrenamientos próximos',
        totalTrainings: 0,
        trainings: [],
      };
    }

    const where: any = {
      date: { gte: today },
    };

    if (activityId) {
      where.activityId = activityId;
    } else if (allowedActivityIds) {
      where.activityId = { in: allowedActivityIds };
    }

    const trainings = await this.prisma.training.findMany({
      where,
      take: limit,
      include: {
        activity: true,
        createdBy: { select: { id: true, email: true } },
      },
      orderBy: { date: 'asc' },
    });

    return {
      message: 'Entrenamientos próximos',
      totalTrainings: trainings.length,
      trainings,
    };
  }
}
