import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Hashear contraseña
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  // Validar contraseña
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Login
  async login(email: string, password: string) {
    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        athlete: true,
        coach: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validar contraseña
    const isPasswordValid = await this.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    // Retornar usuario sin password y el token
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      role: user.role,
    };
  }

  // Registrar Coach
  async registerCoach(data: {
    email: string;
    password: string;
    phone?: string;
  }) {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await this.hashPassword(data.password);

    // Crear usuario coach
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
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

    // Generar token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    // Retornar sin password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      role: user.role,
    };
  }

  // Registrar Admin (solo para setup inicial o super admin)
  async registerAdmin(data: {
    email: string;
    password: string;
    phone?: string;
  }) {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await this.hashPassword(data.password);

    // Crear usuario admin (sin perfil de coach/athlete)
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: 'ADMIN' as Role,
      },
    });

    // Generar token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    // Retornar sin password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      role: user.role,
    };
  }

  // Obtener perfil del usuario autenticado
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        athlete: true,
        coach: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  // Solicitar recuperación de contraseña
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por seguridad, no indicamos si el usuario existe o no
      return { message: 'Si el email existe, se enviarán las instrucciones.' };
    }

    // Generar token aleatorio
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora de validez

    // Guardar token en DB
    await this.prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // TODO: Integrar servicio de email real (SendGrid, AWS SES, etc.)
    // Por ahora, logueamos el link en consola para desarrollo
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    console.log(`📧 [MOCK EMAIL] Recuperación de contraseña para ${email}`);
    console.log(`🔗 Link: ${resetLink}`);

    return { message: 'Si el email existe, se enviarán las instrucciones.' };
  }

  // Resetear contraseña con token
  async resetPassword(token: string, newPassword: string) {
    // Buscar token
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Verificar expiración
    if (resetToken.expiresAt < new Date()) {
      // Eliminar token expirado
      await this.prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Hashear nueva contraseña
    const hashedPassword = await this.hashPassword(newPassword);

    // Actualizar usuario
    await this.prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Eliminar el token usado (y todos los de ese usuario por limpieza)
    await this.prisma.passwordResetToken.deleteMany({
      where: { email: resetToken.email },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
