# SmartCloud 2T Backend

Backend API para el sistema de gestión de entrenamientos CrossFit/Funcional.

## 🚀 Características

- **Autenticación JWT** con HttpOnly Cookies (seguro contra XSS)
- **Sistema de Roles**: ADMIN, COACH, ATHLETE
- **Panel de Administración** para gestionar coaches y atletas
- **Gestión de Atletas** con métricas corporales y de rendimiento
- **Sistema de Pagos** con seguimiento y validación
- **WODs (Workouts)** con asignación a atletas
- **Notificaciones** (WhatsApp)
- **Métricas personalizadas** con JSON flexible

## 📋 Requisitos Previos

- Node.js 18+
- PostgreSQL
- pnpm (recomendado)

## 🔧 Instalación

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones de base de datos
pnpm prisma migrate dev

# (Opcional) Seed de datos iniciales
pnpm prisma db seed
```

## 🏃 Desarrollo

```bash
# Modo desarrollo con hot-reload
pnpm run start:dev

# Modo producción
pnpm run start:prod
```

El servidor estará disponible en `http://localhost:3000`

## 👤 Crear Primer Admin

Para crear el primer usuario administrador:

```bash
node scripts/create-first-admin.js
```

O configurar variables de entorno:

```bash
ADMIN_EMAIL=admin@tu-dominio.com \
ADMIN_PASSWORD=tu_password_seguro \
ADMIN_PHONE=+5491112345678 \
node scripts/create-first-admin.js
```

**Credenciales por defecto**:

- Email: `admin@smartcloud.com`
- Password: `Admin123456!`

⚠️ **Importante**: Cambia la contraseña después del primer login en producción.

## 🔐 Autenticación

El sistema usa JWT con HttpOnly Cookies para máxima seguridad:

- **Login**: `POST /auth/login`
- **Register Coach**: `POST /auth/register-coach`
- **Register Admin**: `POST /auth/register-admin`
- **Me**: `GET /auth/me` (requiere autenticación)
- **Logout**: `POST /auth/logout`

Ver documentación completa en:

- [AUTH_GUIDE.md](./AUTH_GUIDE.md)
- [HTTPONLY_COOKIES_GUIDE.md](./HTTPONLY_COOKIES_GUIDE.md)
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)

## 🎯 Roles y Permisos

### ADMIN

- Gestionar coaches (crear, listar, eliminar)
- Gestionar atletas (listar, ver detalles, eliminar)
- Ver todos los usuarios del sistema

### COACH

- Gestionar sus atletas
- Crear y asignar WODs
- Ver métricas de sus atletas
- Gestionar pagos

### ATHLETE

- Ver sus entrenamientos
- Registrar métricas
- Ver su historial de pagos

## 🧪 Testing

```bash
# Tests unitarios
pnpm run test

# Tests de autenticación
node test-auth-cookies.js

# Tests de admin
node test-admin.js

# Tests e2e
pnpm run test:e2e
```

## 📚 Documentación de API

- **Autenticación**: [AUTH_GUIDE.md](./AUTH_GUIDE.md)
- **Admin**: [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
- **API Completa**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🗄️ Base de Datos

### Migraciones

```bash
# Crear nueva migración
pnpm prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
pnpm prisma migrate deploy

# Regenerar Prisma Client
pnpm prisma generate
```

### Prisma Studio

```bash
# Abrir interfaz visual de BD
pnpm prisma studio
```

## 📦 Estructura del Proyecto

```
src/
├── admin/              # Gestión de admin (coaches, atletas)
├── athletes/           # Gestión de atletas
├── auth/               # Autenticación y autorización
├── fees/               # Configuración de tarifas
├── media/              # Gestión de archivos
├── notifications/      # Sistema de notificaciones
├── payments/           # Sistema de pagos
├── prisma/             # Configuración de Prisma
├── users/              # Gestión de usuarios
├── wods/               # Gestión de entrenamientos
├── athlete-activities/ # Actividades de atletas
├── athlete-metrics/    # Métricas de atletas
└── app.module.ts       # Módulo principal
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT con expiración de 7 días
- HttpOnly Cookies (protección contra XSS)
- CORS configurado con `credentials: true`
- Guards de autenticación y roles
- Validación de inputs

## 🌐 CORS

Para desarrollo, el frontend debe estar en `http://localhost:3001`. Modificar en `main.ts` para producción:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
});
```

## 🚀 Despliegue

### Variables de Entorno Requeridas

```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="tu_secreto_muy_seguro"
NODE_ENV="production"
FRONTEND_URL="https://tu-dominio.com"
```

### Docker (Opcional)

```bash
docker-compose up -d
```

---

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
