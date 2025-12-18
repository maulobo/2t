import { Module } from '@nestjs/common';
import { AthleteActivitiesService } from './athlete-activities.service';
import { AthleteActivitiesController } from './athlete-activities.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AthleteActivitiesController],
  providers: [AthleteActivitiesService],
  exports: [AthleteActivitiesService],
})
export class AthleteActivitiesModule {}
