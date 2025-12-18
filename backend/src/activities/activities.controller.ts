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
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // ==================== ENDPOINTS ADMIN ====================

  /**
   * Crear una actividad
   * POST /activities
   */
  @Post()
  @Roles('ADMIN', 'COACH')
  async create(
    @Body()
    body: {
      name: string;
      description?: string;
      price?: number;
      color?: string;
      icon?: string;
      active?: boolean;
    },
  ) {
    return this.activitiesService.create(body);
  }

  /**
   * Actualizar una actividad
   * PUT /activities/:id
   */
  @Put(':id')
  @Roles('ADMIN', 'COACH')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      price?: number;
      color?: string;
      icon?: string;
      active?: boolean;
    },
  ) {
    return this.activitiesService.update(id, body);
  }

  /**
   * Eliminar (desactivar) una actividad
   * DELETE /activities/:id
   */
  @Delete(':id')
  @Roles('ADMIN', 'COACH')
  async remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }

  /**
   * Asignar actividad a un atleta
   * POST /activities/assign
   */
  @Post('assign')
  @Roles('ADMIN', 'COACH')
  async assignToAthlete(
    @Body()
    body: {
      athleteId: string;
      activityId: string;
      startDate?: string;
      notes?: string;
    },
  ) {
    return this.activitiesService.assignToAthlete({
      athleteId: body.athleteId,
      activityId: body.activityId,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      notes: body.notes,
    });
  }

  /**
   * Desactivar actividad de un atleta
   * DELETE /activities/assignments/:id
   */
  @Delete('assignments/:id')
  @Roles('ADMIN', 'COACH')
  async deactivateAthleteActivity(@Param('id') id: string) {
    return this.activitiesService.deactivateAthleteActivity(id);
  }

  // ==================== ENDPOINTS PÚBLICOS (AUTENTICADOS) ====================

  /**
   * Listar todas las actividades
   * GET /activities?includeInactive=true
   */
  @Get()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.activitiesService.findAll(includeInactive === 'true');
  }

  /**
   * Obtener una actividad específica
   * GET /activities/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  /**
   * Obtener actividades de un atleta
   * GET /athletes/:athleteId/activities?onlyActive=true
   */
  @Get('athletes/:athleteId/activities')
  async getAthleteActivities(
    @Param('athleteId') athleteId: string,
    @Query('onlyActive') onlyActive?: string,
  ) {
    return this.activitiesService.getAthleteActivities(
      athleteId,
      onlyActive !== 'false',
    );
  }
}
