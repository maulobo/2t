import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ============ COACHES ============

  async getAllCoaches() {
    const coaches = await this.prisma.user.findMany({
      where: { role: Role.COACH },
      include: {
        coach: true,
        coachAthletes: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Remover passwords
    return coaches.map(({ password: _, ...coach }) => coach);
  }

  async createCoach(data: { email: string; password: string; phone?: string }) {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear usuario y perfil de coach
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: Role.COACH,
        coach: {
          create: {},
        },
      },
      include: {
        coach: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteCoach(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { coach: true },
    });

    if (!user || user.role !== Role.COACH) {
      throw new NotFoundException('Coach no encontrado');
    }

    // El CASCADE en la DB eliminará el perfil de coach automáticamente
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Coach eliminado correctamente', id: userId };
  }

  // ============ ATHLETES ============

  async getAllAthletes() {
    const athletes = await this.prisma.athleteProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        coach: {
          select: {
            id: true,
            email: true,
          },
        },
        metrics: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
      orderBy: { user: { createdAt: 'desc' } },
    });

    return athletes;
  }

  async getAthleteById(athleteId: string) {
    const athlete = await this.prisma.athleteProfile.findUnique({
      where: { id: athleteId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        coach: {
          select: {
            id: true,
            email: true,
          },
        },
        metrics: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        activities: {
          orderBy: { startDate: 'desc' },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!athlete) {
      throw new NotFoundException('Atleta no encontrado');
    }

    return athlete;
  }

  async deleteAthlete(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { athlete: true },
    });

    if (!user || user.role !== Role.ATHLETE) {
      throw new NotFoundException('Atleta no encontrado');
    }

    // El CASCADE en la DB eliminará el perfil de atleta automáticamente
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Atleta eliminado correctamente', id: userId };
  }

  // ============ USERS ============

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        athlete: true,
        coach: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Remover passwords
    return users.map(({ password: _, ...user }) => user);
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        athlete: {
          include: {
            coach: {
              select: {
                id: true,
                email: true,
              },
            },
            metrics: {
              orderBy: { date: 'desc' },
              take: 5,
            },
            activities: {
              orderBy: { startDate: 'desc' },
            },
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
        coach: true,
        coachAthletes: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
