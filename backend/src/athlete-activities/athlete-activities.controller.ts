import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AthleteActivitiesService } from './athlete-activities.service';

@Controller('athlete-activities')
export class AthleteActivitiesController {
  constructor(
    private readonly athleteActivitiesService: AthleteActivitiesService,
  ) {}

  // Obtener historial completo de actividades de un atleta
  @Get('athlete/:athleteId')
  findByAthlete(@Param('athleteId') athleteId: string) {
    return this.athleteActivitiesService.findByAthlete(athleteId);
  }

  // Obtener solo actividades activas de un atleta
  @Get('athlete/:athleteId/active')
  findActiveByAthlete(@Param('athleteId') athleteId: string) {
    return this.athleteActivitiesService.findActiveByAthlete(athleteId);
  }

  // Obtener estadísticas de actividades
  @Get('stats')
  getStats() {
    return this.athleteActivitiesService.getActivityStats();
  }

  // Agregar nueva actividad a un atleta
  @Post()
  addActivity(
    @Body()
    addActivityDto: {
      athleteId: string;
      activityId: string;
      startDate?: string;
      notes?: string;
    },
  ) {
    return this.athleteActivitiesService.createActivity({
      ...addActivityDto,
      startDate: addActivityDto.startDate
        ? new Date(addActivityDto.startDate)
        : undefined,
    });
  }

  // Finalizar/terminar una actividad
  @Patch(':id/end')
  endActivity(@Param('id') id: string, @Body() body?: { endDate?: string }) {
    return this.athleteActivitiesService.endActivity(
      id,
      body?.endDate ? new Date(body.endDate) : undefined,
    );
  }

  // Reactivar una actividad
  @Patch(':id/reactivate')
  reactivateActivity(@Param('id') id: string) {
    return this.athleteActivitiesService.reactivateActivity(id);
  }

  // Actualizar notas
  @Patch(':id/notes')
  updateNotes(@Param('id') id: string, @Body() body: { notes: string }) {
    return this.athleteActivitiesService.updateNotes(id, body.notes);
  }

  // Eliminar actividad del historial
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.athleteActivitiesService.remove(id);
  }
}
