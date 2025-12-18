import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AthletesService {
  constructor(private prisma: PrismaService) {}

  // Obtener todos los atletas de un coach
  async findAllByCoach(coachId: string) {
    const athletes = await this.prisma.athleteProfile.findMany({
      where: { coachId },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    // Para cada atleta, encontrar el pago más relevante
    return athletes.map((athlete) => {
      const now = new Date();

      // Buscar el pago vigente (que cubre el período actual)
      const currentPayment = athlete.payments.find(
        (p) =>
          p.status === 'APPROVED' && p.periodStart <= now && p.periodEnd >= now,
      );

      // Si hay pago vigente, mostrar ese; si no, mostrar el último pago
      const relevantPayment = currentPayment || athlete.payments[0];

      return {
        ...athlete,
        payments: relevantPayment ? [relevantPayment] : [],
      };
    });
  }

  async findAll() {
    const athletes = await this.prisma.athleteProfile.findMany({
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    // Para cada atleta, encontrar el pago más relevante
    return athletes.map((athlete) => {
      const now = new Date();

      // Buscar el pago vigente (que cubre el período actual)
      const currentPayment = athlete.payments.find(
        (p) =>
          p.status === 'APPROVED' && p.periodStart <= now && p.periodEnd >= now,
      );

      // Si hay pago vigente, mostrar ese; si no, mostrar el último pago
      const relevantPayment = currentPayment || athlete.payments[0];

      return {
        ...athlete,
        payments: relevantPayment ? [relevantPayment] : [],
      };
    });
  }

  // Obtener un atleta por ID
  async findOne(id: string) {
    return this.prisma.athleteProfile.findUnique({
      where: { id },
      include: {
        user: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        assignments: {
          include: {
            training: true,
          },
        },
      },
    });
  }

  // Crear un nuevo atleta
  async create(data: {
    email: string;
    password: string;
    phone?: string;
    fullName: string;
    birthDate?: Date;
    coachId?: string;
    activityType?: string;
    height?: number;
    gender?: string;
    bloodType?: string;
    city?: string;
    province?: string;
    country?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    goals?: string;
    injuries?: string;
    medications?: string;
  }) {
    // Filtrar coachId si es una cadena vacía
    const validCoachId = data.coachId?.trim() || undefined;

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: 'ATHLETE',
        athlete: {
          create: {
            fullName: data.fullName,
            birthDate: data.birthDate,
            activityType: data.activityType,
            height: data.height,
            gender: data.gender,
            bloodType: data.bloodType,
            city: data.city,
            province: data.province,
            country: data.country,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
            goals: data.goals,
            injuries: data.injuries,
            medications: data.medications,
            ...(validCoachId && { coachId: validCoachId }),
          } as any, // Cast temporal - los tipos se actualizarán después del restart
        },
      },
      include: {
        athlete: true,
      },
    });
  }

  // Actualizar un atleta
  async update(
    id: string,
    data: {
      fullName?: string;
      birthDate?: Date;
      notes?: string;
      active?: boolean;
      activityType?: string;
      height?: number;
      gender?: string;
      bloodType?: string;
      city?: string;
      province?: string;
      country?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      goals?: string;
      injuries?: string;
      medications?: string;
      phone?: string; // Se actualizará en User
    },
  ) {
    // Separar phone (va a User) del resto (va a AthleteProfile)
    const { phone, ...athleteData } = data;

    // Si hay phone, actualizar el User primero
    if (phone !== undefined) {
      const athlete = await this.prisma.athleteProfile.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (athlete) {
        await this.prisma.user.update({
          where: { id: athlete.userId },
          data: { phone: phone || null }, // Si es string vacío, guardar null
        });
      }
    }

    // Actualizar AthleteProfile
    return this.prisma.athleteProfile.update({
      where: { id },
      data: athleteData,
    });
  }

  // Verificar si el atleta ha pagado este mes
  async checkPaymentStatus(athleteId: string) {
    const now = new Date();
    const payment = await this.prisma.payment.findFirst({
      where: {
        athleteId,
        status: 'APPROVED',
        periodStart: { lte: now },
        periodEnd: { gte: now },
      },
    });

    return {
      isPaid: !!payment,
      payment,
    };
  }

  // Eliminar un atleta (elimina usuario y perfil en cascada)
  async remove(id: string) {
    // Buscar el atleta para obtener el userId
    const athlete = await this.prisma.athleteProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!athlete) {
      throw new Error('Atleta no encontrado');
    }

    // Eliminar el usuario (esto eliminará el perfil en cascada gracias al schema)
    return this.prisma.user.delete({
      where: { id: athlete.userId },
    });
  }
}
