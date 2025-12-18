import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { ActivitiesService } from '../activities/activities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('trainings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainingsController {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  private async getAllowedActivityIds(req: any): Promise<string[] | undefined> {
    if (req.user.role === 'ATHLETE' && req.user.athlete) {
      const activities = await this.activitiesService.getAthleteActivities(
        req.user.athlete.id,
        true, // onlyActive
      );
      return activities.map((a) => a.activityId);
    }
    return undefined;
  }

  // ==================== ENDPOINTS ADMIN ====================

  /**
   * Crear un entrenamiento individual
   * POST /trainings
   */
  @Post()
  @Roles('ADMIN', 'COACH')
  async create(
    @Body()
    body: {
      title: string;
      description: string;
      date: string;
      track?: string;
      videoUrl?: string;
      activityId?: string;
    },
    @Request() req,
  ) {
    return this.trainingsService.create({
      ...body,
      date: body.date, // Asegurarse de que date se pase como string
      createdById: req.user.id, // ✅ Cambiar userId por id
    });
  }

  /**
   * Crear múltiples entrenamientos (carga masiva)
   * POST /trainings/bulk
   */
  @Post('bulk')
  @Roles('ADMIN', 'COACH')
  async createBulk(
    @Body()
    body: {
      trainings: Array<{
        title: string;
        description: string;
        date: string;
        track?: string;
        videoUrl?: string;
        activityId?: string;
      }>;
    },
    @Request() req,
  ) {
    return this.trainingsService.createBulk({
      trainings: body.trainings,
      createdById: req.user.id, // ✅ Cambiar userId por id
    });
  }

  /**
   * Actualizar un entrenamiento
   * PUT /trainings/:id
   */
  @Put(':id')
  @Roles('ADMIN', 'COACH')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      date?: string;
      track?: string;
      videoUrl?: string;
      activityId?: string;
    },
  ) {
    return this.trainingsService.update(id, body);
  }

  /**
   * Eliminar un entrenamiento
   * DELETE /trainings/:id
   */
  @Delete(':id')
  @Roles('ADMIN', 'COACH')
  async delete(@Param('id') id: string) {
    return this.trainingsService.delete(id);
  }

  // ==================== ENDPOINTS PÚBLICOS (AUTENTICADOS) ====================

  /**
   * Obtener entrenamientos del día actual
   * GET /trainings/today
   */
  @Get('today')
  async getToday(@Query('activityId') activityId: string, @Request() req) {
    const allowedIds = await this.getAllowedActivityIds(req);
    return this.trainingsService.getToday(activityId, allowedIds);
  }

  /**
   * Obtener entrenamientos por fecha específica
   * GET /trainings/date?date=YYYY-MM-DD&activityId=xxx
   */
  @Get('date')
  async getByDate(
    @Query('date') date: string,
    @Query('activityId') activityId: string,
    @Request() req,
  ) {
    if (!date) {
      return { error: 'El parámetro date es requerido (formato: YYYY-MM-DD)' };
    }
    const allowedIds = await this.getAllowedActivityIds(req);
    return this.trainingsService.getByDate(date, activityId, allowedIds);
  }

  /**
   * Obtener entrenamientos de un mes completo
   * GET /trainings/month?year=2025&month=11&activityId=xxx
   */
  @Get('month')
  async getByMonth(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('activityId') activityId: string,
    @Request() req,
  ) {
    if (!year || !month) {
      return { error: 'Los parámetros year y month son requeridos' };
    }
    const allowedIds = await this.getAllowedActivityIds(req);
    return this.trainingsService.getByMonth(
      parseInt(year),
      parseInt(month),
      activityId,
      allowedIds,
    );
  }

  /**
   * Obtener entrenamientos por rango de fechas
   * GET /trainings/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&activityId=xxx
   */
  @Get('range')
  async getByRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('activityId') activityId: string,
    @Request() req,
  ) {
    if (!startDate || !endDate) {
      return {
        error: 'Los parámetros startDate y endDate son requeridos',
      };
    }
    const allowedIds = await this.getAllowedActivityIds(req);
    return this.trainingsService.getByRange(
      startDate,
      endDate,
      activityId,
      allowedIds,
    );
  }

  /**
   * Obtener histórico de entrenamientos (pasados)
   * GET /trainings/history/past?limit=20&activityId=xxx
   */
  @Get('history/past')
  async getHistory(
    @Query('limit') limit: string = '20',
    @Query('activityId') activityId: string,
    @Request() req,
  ) {
    const allowedIds = await this.getAllowedActivityIds(req);
    return this.trainingsService.getHistory(
      parseInt(limit),
      activityId,
      allowedIds,
    );
  }

  /**
   * Obtener entrenamientos futuros (próximos)
   * GET /trainings/upcoming/future?limit=10&activityId=xxx
   */
  @Get('upcoming/future')
  async getUpcoming(
    @Query('limit') limit: string = '10',
    @Query('activityId') activityId: string,
    @Request() req,
  ) {
    const allowedIds = await this.getAllowedActivityIds(req);
    return this.trainingsService.getUpcoming(
      parseInt(limit),
      activityId,
      allowedIds,
    );
  }

  /**
   * Obtener todos los entrenamientos (con paginación)
   * GET /trainings?page=1&limit=30&activityId=xxx
   */
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '30',
    @Query('activityId') activityId: string,
    @Request() req,
  ) {
    const allowedIds = await this.getAllowedActivityIds(req);
    return this.trainingsService.findAll(
      parseInt(page),
      parseInt(limit),
      activityId,
      allowedIds,
    );
  }

  /**
   * Obtener un entrenamiento específico por ID
   * GET /trainings/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.trainingsService.findOne(id);
  }
}
