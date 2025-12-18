import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { AthleteMetricsService } from './athlete-metrics.service';

@Controller('athlete-metrics')
export class AthleteMetricsController {
  constructor(private readonly athleteMetricsService: AthleteMetricsService) {}

  // Helper para convertir strings a números
  private parseFloatField(value: any): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  private parseIntField(value: any): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    if (typeof value === 'number') return Math.round(value);
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  // Convertir todos los campos numéricos del DTO
  private convertMetricFields(dto: any) {
    return {
      athleteId: dto.athleteId,
      date: dto.date ? new Date(dto.date) : undefined,
      notes: dto.notes || undefined,

      // Métricas corporales (Float)
      weight: this.parseFloatField(dto.weight),
      bodyFatPercent: this.parseFloatField(dto.bodyFatPercent),
      muscleMass: this.parseFloatField(dto.muscleMass),
      bmi: this.parseFloatField(dto.bmi),

      // Perímetros (Float)
      waist: this.parseFloatField(dto.waist),
      hip: this.parseFloatField(dto.hip),
      chest: this.parseFloatField(dto.chest),
      rightArm: this.parseFloatField(dto.rightArm),
      leftArm: this.parseFloatField(dto.leftArm),
      rightThigh: this.parseFloatField(dto.rightThigh),
      leftThigh: this.parseFloatField(dto.leftThigh),

      // Levantamientos (Float)
      backSquat: this.parseFloatField(dto.backSquat),
      frontSquat: this.parseFloatField(dto.frontSquat),
      deadlift: this.parseFloatField(dto.deadlift),
      benchPress: this.parseFloatField(dto.benchPress),
      shoulderPress: this.parseFloatField(dto.shoulderPress),
      cleanAndJerk: this.parseFloatField(dto.cleanAndJerk),
      snatch: this.parseFloatField(dto.snatch),

      // Benchmark WODs (Int)
      franTime: this.parseIntField(dto.franTime),
      murphTime: this.parseIntField(dto.murphTime),
      cindyRounds: this.parseIntField(dto.cindyRounds),
      graceTime: this.parseIntField(dto.graceTime),
      helenTime: this.parseIntField(dto.helenTime),

      // Otros (Int)
      maxPullUps: this.parseIntField(dto.maxPullUps),
      maxPushUps: this.parseIntField(dto.maxPushUps),
      plankTime: this.parseIntField(dto.plankTime),

      // Métricas personalizadas (JSON)
      customMetrics: dto.customMetrics || undefined,
    };
  } // Crear nueva medición
  @Post()
  create(@Body() createMetricDto: any) {
    const convertedData = this.convertMetricFields(createMetricDto);
    return this.athleteMetricsService.create(convertedData);
  }

  // Obtener historial de un atleta
  @Get('athlete/:athleteId')
  findByAthlete(@Param('athleteId') athleteId: string) {
    return this.athleteMetricsService.findByAthlete(athleteId);
  }

  // Obtener última medición
  @Get('athlete/:athleteId/latest')
  findLatest(@Param('athleteId') athleteId: string) {
    return this.athleteMetricsService.findLatest(athleteId);
  }

  // Obtener progreso de peso
  @Get('athlete/:athleteId/weight-progress')
  getWeightProgress(
    @Param('athleteId') athleteId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.athleteMetricsService.getWeightProgress(
      athleteId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  // Obtener Personal Records
  @Get('athlete/:athleteId/personal-records')
  getPersonalRecords(@Param('athleteId') athleteId: string) {
    return this.athleteMetricsService.getPersonalRecords(athleteId);
  }

  // Obtener Benchmark Records
  @Get('athlete/:athleteId/benchmark-records')
  getBenchmarkRecords(@Param('athleteId') athleteId: string) {
    return this.athleteMetricsService.getBenchmarkRecords(athleteId);
  }

  // Actualizar medición
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMetricDto: any) {
    const convertedData = this.convertMetricFields(updateMetricDto);
    return this.athleteMetricsService.update(id, convertedData);
  }

  // Eliminar medición
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.athleteMetricsService.remove(id);
  }
}
