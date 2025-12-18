import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AthletesService } from './athletes.service';

@Controller('athletes')
export class AthletesController {
  constructor(private readonly athletesService: AthletesService) {}

  @Get('coach/:coachId')
  findAllByCoach(@Param('coachId') coachId: string) {
    return this.athletesService.findAllByCoach(coachId);
  }

  @Get()
  findAll() {
    return this.athletesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.athletesService.findOne(id);
  }

  @Get(':id/payment-status')
  checkPaymentStatus(@Param('id') id: string) {
    return this.athletesService.checkPaymentStatus(id);
  }

  @Post()
  create(
    @Body()
    createAthleteDto: {
      email: string;
      password: string;
      phone?: string;
      fullName: string;
      birthDate?: string;
      coachId?: string;
      activityType?: string;
      height?: string | number; // Acepta string o number
      gender?: string;
      bloodType?: string;
      city?: string;
      province?: string;
      country?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      goals?: string;
      injuries?: string;
      medications?: string;
    },
  ) {
    // Convertir height a número si viene como string
    const height = createAthleteDto.height
      ? typeof createAthleteDto.height === 'string'
        ? parseFloat(createAthleteDto.height) || undefined
        : createAthleteDto.height
      : undefined;

    // Convertir strings vacíos a undefined para campos opcionales
    const cleanData = {
      ...createAthleteDto,
      height,
      birthDate: createAthleteDto.birthDate
        ? new Date(createAthleteDto.birthDate)
        : undefined,
      gender: createAthleteDto.gender || undefined,
      bloodType: createAthleteDto.bloodType || undefined,
      city: createAthleteDto.city || undefined,
      province: createAthleteDto.province || undefined,
      emergencyContactName: createAthleteDto.emergencyContactName || undefined,
      emergencyContactPhone:
        createAthleteDto.emergencyContactPhone || undefined,
      goals: createAthleteDto.goals || undefined,
      injuries: createAthleteDto.injuries || undefined,
      medications: createAthleteDto.medications || undefined,
    };

    return this.athletesService.create(cleanData);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateAthleteDto: {
      fullName?: string;
      birthDate?: string;
      notes?: string;
      active?: boolean;
      activityType?: string;
      height?: string | number; // Acepta string o number
      gender?: string;
      bloodType?: string;
      city?: string;
      province?: string;
      country?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      goals?: string;
      injuries?: string;
      medications?: string;
      phone?: string;
    },
  ) {
    // Convertir height a número si viene como string
    const height = updateAthleteDto.height
      ? typeof updateAthleteDto.height === 'string'
        ? parseFloat(updateAthleteDto.height) || undefined
        : updateAthleteDto.height
      : undefined;

    // Convertir strings vacíos a undefined para campos opcionales
    const cleanData = {
      ...updateAthleteDto,
      height,
      birthDate: updateAthleteDto.birthDate
        ? new Date(updateAthleteDto.birthDate)
        : undefined,
      gender: updateAthleteDto.gender || undefined,
      bloodType: updateAthleteDto.bloodType || undefined,
      city: updateAthleteDto.city || undefined,
      province: updateAthleteDto.province || undefined,
      emergencyContactName: updateAthleteDto.emergencyContactName || undefined,
      emergencyContactPhone:
        updateAthleteDto.emergencyContactPhone || undefined,
      goals: updateAthleteDto.goals || undefined,
      injuries: updateAthleteDto.injuries || undefined,
      medications: updateAthleteDto.medications || undefined,
    };

    return this.athletesService.update(id, cleanData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.athletesService.remove(id);
  }
}
