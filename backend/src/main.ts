import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar cookie parser
  app.use(cookieParser());

  // Configurar CORS con credentials
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://st8l4b7x-3001.brs.devtunnels.ms',
    ], // Frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // ← Importante: permite enviar cookies cross-origin
    allowedHeaders: 'Content-Type,Authorization',
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
