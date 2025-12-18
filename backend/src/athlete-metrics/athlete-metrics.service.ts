import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AthleteMetricsService {
  constructor(private prisma: PrismaService) {}

  // Crear nueva medición
  async create(data: {
    athleteId: string;
    date?: Date;
    weight?: number;
    bodyFatPercent?: number;
    muscleMass?: number;
    waist?: number;
    hip?: number;
    chest?: number;
    rightArm?: number;
    leftArm?: number;
    rightThigh?: number;
    leftThigh?: number;
    backSquat?: number;
    frontSquat?: number;
    deadlift?: number;
    benchPress?: number;
    shoulderPress?: number;
    cleanAndJerk?: number;
    snatch?: number;
    franTime?: number;
    murphTime?: number;
    cindyRounds?: number;
    graceTime?: number;
    helenTime?: number;
    maxPullUps?: number;
    maxPushUps?: number;
    plankTime?: number;
    customMetrics?: any; // JSON con métricas personalizadas
    notes?: string;
  }) {
    // Calcular BMI si hay peso y altura
    let bmi: number | undefined;
    if (data.weight) {
      const athlete = await this.prisma.athleteProfile.findUnique({
        where: { id: data.athleteId },
        select: { height: true },
      });
      if (athlete?.height) {
        bmi = data.weight / Math.pow(athlete.height / 100, 2);
      }
    }

    return this.prisma.athleteMetric.create({
      data: {
        ...data,
        bmi,
      },
      include: {
        athlete: {
          select: {
            fullName: true,
            height: true,
          },
        },
      },
    });
  }

  // Obtener historial completo de un atleta
  async findByAthlete(athleteId: string) {
    return this.prisma.athleteMetric.findMany({
      where: { athleteId },
      orderBy: { date: 'desc' },
    });
  }

  // Obtener última medición
  async findLatest(athleteId: string) {
    return this.prisma.athleteMetric.findFirst({
      where: { athleteId },
      orderBy: { date: 'desc' },
    });
  }

  // Obtener progreso de peso en un rango de fechas
  async getWeightProgress(athleteId: string, from?: Date, to?: Date) {
    const where: any = { athleteId, weight: { not: null } };
    if (from) where.date = { ...where.date, gte: from };
    if (to) where.date = { ...where.date, lte: to };

    return this.prisma.athleteMetric.findMany({
      where,
      select: {
        date: true,
        weight: true,
        bodyFatPercent: true,
        bmi: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  // Obtener PRs (Personal Records) de levantamientos
  async getPersonalRecords(athleteId: string) {
    const metrics = await this.prisma.athleteMetric.findMany({
      where: {
        athleteId,
        OR: [
          { backSquat: { not: null } },
          { frontSquat: { not: null } },
          { deadlift: { not: null } },
          { benchPress: { not: null } },
          { shoulderPress: { not: null } },
          { cleanAndJerk: { not: null } },
          { snatch: { not: null } },
        ],
      },
      orderBy: { date: 'desc' },
    });

    // Obtener el máximo de cada ejercicio
    const prs = {
      backSquat: { max: 0, date: null as Date | null },
      frontSquat: { max: 0, date: null as Date | null },
      deadlift: { max: 0, date: null as Date | null },
      benchPress: { max: 0, date: null as Date | null },
      shoulderPress: { max: 0, date: null as Date | null },
      cleanAndJerk: { max: 0, date: null as Date | null },
      snatch: { max: 0, date: null as Date | null },
    };

    metrics.forEach((metric) => {
      if (metric.backSquat && metric.backSquat > prs.backSquat.max) {
        prs.backSquat = { max: metric.backSquat, date: metric.date };
      }
      if (metric.frontSquat && metric.frontSquat > prs.frontSquat.max) {
        prs.frontSquat = { max: metric.frontSquat, date: metric.date };
      }
      if (metric.deadlift && metric.deadlift > prs.deadlift.max) {
        prs.deadlift = { max: metric.deadlift, date: metric.date };
      }
      if (metric.benchPress && metric.benchPress > prs.benchPress.max) {
        prs.benchPress = { max: metric.benchPress, date: metric.date };
      }
      if (
        metric.shoulderPress &&
        metric.shoulderPress > prs.shoulderPress.max
      ) {
        prs.shoulderPress = { max: metric.shoulderPress, date: metric.date };
      }
      if (metric.cleanAndJerk && metric.cleanAndJerk > prs.cleanAndJerk.max) {
        prs.cleanAndJerk = { max: metric.cleanAndJerk, date: metric.date };
      }
      if (metric.snatch && metric.snatch > prs.snatch.max) {
        prs.snatch = { max: metric.snatch, date: metric.date };
      }
    });

    return prs;
  }

  // Obtener mejores tiempos de benchmark WODs
  async getBenchmarkRecords(athleteId: string) {
    const metrics = await this.prisma.athleteMetric.findMany({
      where: {
        athleteId,
        OR: [
          { franTime: { not: null } },
          { murphTime: { not: null } },
          { cindyRounds: { not: null } },
          { graceTime: { not: null } },
          { helenTime: { not: null } },
        ],
      },
      orderBy: { date: 'desc' },
    });

    const records = {
      fran: { best: Infinity, date: null as Date | null },
      murph: { best: Infinity, date: null as Date | null },
      cindy: { best: 0, date: null as Date | null }, // Más rounds = mejor
      grace: { best: Infinity, date: null as Date | null },
      helen: { best: Infinity, date: null as Date | null },
    };

    metrics.forEach((metric) => {
      if (metric.franTime && metric.franTime < records.fran.best) {
        records.fran = { best: metric.franTime, date: metric.date };
      }
      if (metric.murphTime && metric.murphTime < records.murph.best) {
        records.murph = { best: metric.murphTime, date: metric.date };
      }
      if (metric.cindyRounds && metric.cindyRounds > records.cindy.best) {
        records.cindy = { best: metric.cindyRounds, date: metric.date };
      }
      if (metric.graceTime && metric.graceTime < records.grace.best) {
        records.grace = { best: metric.graceTime, date: metric.date };
      }
      if (metric.helenTime && metric.helenTime < records.helen.best) {
        records.helen = { best: metric.helenTime, date: metric.date };
      }
    });

    return records;
  }

  // Actualizar una medición
  async update(id: string, data: any) {
    return this.prisma.athleteMetric.update({
      where: { id },
      data,
    });
  }

  // Eliminar una medición
  async remove(id: string) {
    return this.prisma.athleteMetric.delete({
      where: { id },
    });
  }
}
