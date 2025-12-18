import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Login para coaches y atletas
  @Post('login')
  async login(
    @Body()
    loginDto: {
      email: string;
      password: string;
    },
    @Response({ passthrough: true }) response: ExpressResponse,
  ) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    // Configurar cookie HttpOnly con el token
    response.cookie('access_token', result.token, {
      httpOnly: true, // No accesible desde JavaScript (protección XSS)
      secure: true, // Siempre true para túneles HTTPS
      sameSite: 'none', // 'none' permite cross-site (necesario para túneles)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
      path: '/', // Cookie disponible en toda la app
    });

    // Retornar solo el usuario y rol (sin el token en el body)
    return {
      user: result.user,
      role: result.role,
    };
  }

  // Registro de coach
  @Post('register-coach')
  async registerCoach(
    @Body()
    registerDto: {
      email: string;
      password: string;
      phone?: string;
    },
    @Response({ passthrough: true }) response: ExpressResponse,
  ) {
    const result = await this.authService.registerCoach(registerDto);

    // Configurar cookie HttpOnly con el token
    response.cookie('access_token', result.token, {
      httpOnly: true,
      secure: true, // Siempre true para túneles HTTPS
      sameSite: 'none', // 'none' permite cross-site (necesario para túneles)
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Retornar solo el usuario y rol (sin el token en el body)
    return {
      user: result.user,
      role: result.role,
    };
  }

  // Registro de admin (protegido - solo para setup inicial o super admin)
  // TODO: En producción, proteger con guard adicional o deshabilitar después del primer admin
  @Post('register-admin')
  async registerAdmin(
    @Body()
    registerDto: {
      email: string;
      password: string;
      phone?: string;
    },
    @Response({ passthrough: true }) response: ExpressResponse,
  ) {
    const result = await this.authService.registerAdmin(registerDto);

    // Configurar cookie HttpOnly con el token
    response.cookie('access_token', result.token, {
      httpOnly: true,
      secure: true, // Siempre true para túneles HTTPS
      sameSite: 'none', // 'none' permite cross-site (necesario para túneles)
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Retornar solo el usuario y rol (sin el token en el body)
    return {
      user: result.user,
      role: result.role,
    };
  }

  // Obtener perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  // Logout - eliminar cookie
  @Post('logout')
  async logout(@Response({ passthrough: true }) response: ExpressResponse) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: true, // Siempre true para túneles HTTPS
      sameSite: 'none', // 'none' permite cross-site (necesario para túneles)
      path: '/',
    });

    return { message: 'Logout exitoso' };
  }
  // Solicitar recuperación de contraseña
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  // Resetear contraseña
  @Post('reset-password')
  async resetPassword(
    @Body() body: { token: string; newPassword: string },
  ) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
