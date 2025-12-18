import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Crear un coach
  async createCoach(data: { email: string; password: string; phone?: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password, // TODO: hashear con bcrypt
        phone: data.phone,
        role: 'COACH',
        coach: {
          create: {},
        },
      },
      include: {
        coach: true,
      },
    });
  }

  // Listar todos los coaches
  async findAllCoaches() {
    return this.prisma.user.findMany({
      where: { role: 'COACH' },
      include: {
        coach: true,
      },
    });
  }
}
