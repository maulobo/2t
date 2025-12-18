# Implementación del Backend para Atletas

## Endpoint necesario en NestJS

### GET /api/athletes

**Query Parameters:**
- `page` (number, optional): Número de página (default: 1)
- `pageSize` (number, optional): Cantidad de items por página (default: 10)
- `search` (string, optional): Búsqueda por nombre o email
- `active` (boolean, optional): Filtrar por estado activo/inactivo

**Response:**
```json
{
  "athletes": [
    {
      "id": "string",
      "userId": "string",
      "fullName": "string",
      "birthDate": "2000-01-01T00:00:00.000Z",
      "notes": "string",
      "active": true,
      "coachId": "string",
      "user": {
        "email": "athlete@example.com",
        "phone": "+54911XXXXXXXX"
      },
      "coach": {
        "user": {
          "email": "coach@example.com"
        }
      },
      "_count": {
        "payments": 5,
        "assignments": 10
      }
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

## Ejemplo de implementación en NestJS

### athletes.controller.ts
```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { AthletesService } from './athletes.service';

@Controller('athletes')
export class AthletesController {
  constructor(private readonly athletesService: AthletesService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('active') active?: string,
  ) {
    return this.athletesService.findAll({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      search,
      active: active ? active === 'true' : undefined,
    });
  }
}
```

### athletes.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface FindAllParams {
  page: number;
  pageSize: number;
  search?: string;
  active?: boolean;
}

@Injectable()
export class AthletesService {
  constructor(private prisma: PrismaService) {}

  async findAll({ page, pageSize, search, active }: FindAllParams) {
    const skip = (page - 1) * pageSize;

    // Construir el where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (active !== undefined) {
      where.active = active;
    }

    // Ejecutar consultas en paralelo
    const [athletes, total] = await Promise.all([
      this.prisma.athleteProfile.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              email: true,
              phone: true,
            },
          },
          coach: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              payments: true,
              assignments: true,
            },
          },
        },
        orderBy: {
          fullName: 'asc',
        },
      }),
      this.prisma.athleteProfile.count({ where }),
    ]);

    return {
      athletes,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
```

### DELETE /api/athletes/:id

**Response:**
```json
{
  "message": "Athlete deleted successfully"
}
```

**Implementación:**
```typescript
@Delete(':id')
async remove(@Param('id') id: string) {
  // Primero eliminar el usuario asociado (cascade delete)
  const athlete = await this.prisma.athleteProfile.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!athlete) {
    throw new NotFoundException('Athlete not found');
  }

  // El schema de Prisma debe tener onDelete: Cascade configurado
  await this.prisma.user.delete({
    where: { id: athlete.userId },
  });

  return { message: 'Athlete deleted successfully' };
}
```

## Configuración de CORS en NestJS

Asegúrate de configurar CORS en tu `main.ts`:

```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
});
```
