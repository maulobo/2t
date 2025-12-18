# 🔐 Configuración de CORS y Autenticación

## 🎯 Respuesta a tu pregunta

### ¿Pasar por API Routes o configurar CORS en NestJS?

**✅ RECOMENDACIÓN: Configurar CORS en NestJS**

### Razones:

1. **Performance**: Sin proxy intermedio, comunicación directa
2. **Simplicidad**: Menos código que mantener
3. **Estándar**: Así funciona en producción
4. **Autenticación**: JWT en headers es el estándar de la industria
5. **Escalabilidad**: Mejor arquitectura a largo plazo

---

## 📋 Configuración de CORS en NestJS

### 1. Configurar CORS en `main.ts`

```typescript
// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',      // Next.js dev
      'http://localhost:3001',      // Alternativa
      'https://tu-dominio.com',     // Producción
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
    ],
    credentials: true, // Importante para cookies/auth
  });

  // Global prefix para todas las rutas
  app.setGlobalPrefix('api');

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(3000);
  console.log('🚀 Backend running on http://localhost:3000');
}
bootstrap();
```

### 2. Variables de entorno en NestJS

```bash
# backend/.env
PORT=3000
DATABASE_URL="postgresql://..."
JWT_SECRET="tu-super-secreto-cambiar-en-produccion"
JWT_EXPIRATION="7d"

# CORS
FRONTEND_URL="http://localhost:3000"
```

### 3. Configuración dinámica de CORS

```typescript
// backend/src/main.ts
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
```

---

## 🔐 Implementación de Autenticación JWT

### 1. Instalar dependencias

```bash
cd backend
pnpm install @nestjs/jwt @nestjs/passport passport passport-jwt
pnpm install -D @types/passport-jwt
```

### 2. Crear módulo de Auth

```typescript
// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
```

### 3. JWT Strategy

```typescript
// backend/src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Payload viene del token JWT
    const { sub: userId, email, role } = payload;

    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Este objeto se agrega a request.user
    return user;
  }
}
```

### 4. Auth Service

```typescript
// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(email: string, password: string, role: string) {
    // Verificar si existe
    const exists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    // Generar token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
```

### 5. Auth Controller

```typescript
// backend/src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

class LoginDto {
  email: string;
  password: string;
}

class RegisterDto {
  email: string;
  password: string;
  role: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.role,
    );
  }
}
```

### 6. Guard para proteger rutas

```typescript
// backend/src/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 7. Usar el guard en los controllers

```typescript
// backend/src/athletes/athletes.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('athletes')
@UseGuards(JwtAuthGuard) // 🔒 Proteger todas las rutas
export class AthletesController {
  @Get()
  findAll() {
    // Solo usuarios autenticados pueden acceder
    return 'Lista de atletas';
  }
}
```

---

## 🎨 Frontend: Actualizar SDK para usar JWT

### 1. Actualizar `client.ts`

```typescript
// src/lib/api/client.ts
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Configurar token de autenticación
   */
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Limpiar token de autenticación
   */
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Obtener token desde localStorage
   */
  private getTokenFromStorage(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Método genérico para hacer peticiones
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {}, cache, revalidate } = config;

    // Agregar token automáticamente desde localStorage
    const token = this.getTokenFromStorage();
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseURL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      ...(cache && { cache }),
      ...(revalidate !== undefined && { next: { revalidate } }),
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Si es 401, limpiar token
        if (response.status === 401) {
          this.clearAuthToken();
          localStorage.removeItem('auth_token');
        }
        
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Error desconocido',
        0,
        error
      );
    }
  }

  // ... resto de métodos (get, post, put, etc.)
}
```

### 2. Crear Auth API

```typescript
// src/lib/api/auth.ts
import { apiClient } from './client';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const authApi = {
  async login(data: LoginDto): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    
    // Guardar token en localStorage
    localStorage.setItem('auth_token', response.access_token);
    
    // Configurar token en el cliente
    apiClient.setAuthToken(response.access_token);
    
    return response;
  },

  async logout() {
    // Limpiar token
    localStorage.removeItem('auth_token');
    apiClient.clearAuthToken();
  },

  async getStoredToken(): Promise<string | null> {
    return localStorage.getItem('auth_token');
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  },
};
```

### 3. Hook de autenticación

```typescript
// src/lib/api/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginDto } from '../auth';
import { useRouter } from 'next/navigation';

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: () => {
      // Redirigir al dashboard
      router.push('/');
      
      // Invalidar todas las queries para refrescar datos
      queryClient.invalidateQueries();
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Limpiar caché
      queryClient.clear();
      
      // Redirigir al login
      router.push('/signin');
    },
  });
}

export function useAuth() {
  return useQuery({
    queryKey: ['auth'],
    queryFn: () => authApi.isAuthenticated(),
    staleTime: Infinity, // No revalidar automáticamente
  });
}
```

### 4. Ejemplo de Login Form

```typescript
// src/app/(full-width-pages)/(auth)/signin/page.tsx
"use client";

import { useState } from "react";
import { useLogin } from "@/lib/api/hooks/useAuth";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await loginMutation.mutateAsync({ email, password });
      // Redirige automáticamente en onSuccess
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      
      <button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>
      
      {loginMutation.isError && (
        <p className="text-red-500">
          Error: {loginMutation.error.message}
        </p>
      )}
    </form>
  );
}
```

---

## 🚀 Flujo completo de autenticación

### 1. Usuario hace login
```
Frontend → POST /api/auth/login → NestJS
NestJS → Valida credenciales → Genera JWT
NestJS → Devuelve { access_token, user }
Frontend → Guarda token en localStorage
Frontend → Configura apiClient.setAuthToken(token)
```

### 2. Usuario hace request a atletas
```
Frontend → useAthletes() hook
React Query → llama athletesApi.getAll()
athletesApi → llama apiClient.get('/athletes')
apiClient → Lee token de localStorage
apiClient → Agrega header: Authorization: Bearer token
apiClient → fetch() a http://localhost:3000/api/athletes
NestJS → JwtAuthGuard valida token
NestJS → Agrega user a request
NestJS → Ejecuta controller
NestJS → Devuelve datos
```

### 3. Token inválido o expirado
```
NestJS → Devuelve 401 Unauthorized
apiClient → Detecta 401
apiClient → Limpia localStorage
apiClient → Limpia apiClient headers
Frontend → Redirige a /signin
```

---

## 🎯 Resumen de ventajas

### ✅ CORS en NestJS + JWT
- Comunicación directa (mejor performance)
- Estándar de la industria
- Fácil de mantener
- Seguro con HTTPS en producción
- Token expira automáticamente
- Escalable

### ❌ API Routes como proxy
- Doble latencia
- Más código que mantener
- Duplica lógica del SDK
- Complica debugging
- No es necesario para tu caso

---

## 🔒 Seguridad en producción

1. **HTTPS obligatorio**: El token viaja en headers
2. **JWT_SECRET fuerte**: Mínimo 32 caracteres aleatorios
3. **Expiración corta**: 7 días o menos
4. **Refresh tokens**: Implementar para sesiones largas
5. **CORS restrictivo**: Solo tu dominio en producción
6. **Rate limiting**: Limitar requests por IP
7. **Helmet.js**: Headers de seguridad

```typescript
// backend/src/main.ts
import helmet from 'helmet';

app.use(helmet());
```

---

## 📝 Próximos pasos

1. ✅ Configurar CORS en NestJS
2. ✅ Implementar módulo de Auth
3. ✅ Proteger rutas con JwtAuthGuard
4. ✅ Actualizar SDK frontend
5. ⏳ Implementar login/logout en frontend
6. ⏳ Agregar refresh tokens
7. ⏳ Implementar roles (ADMIN, COACH, ATHLETE)

---

**¡Listo! Con CORS configurado, tu frontend puede comunicarse directamente con NestJS de forma segura. 🚀**
