import { Module } from '@nestjs/common';
import { AthleteMetricsService } from './athlete-metrics.service';
import { AthleteMetricsController } from './athlete-metrics.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AthleteMetricsController],
  providers: [AthleteMetricsService],
  exports: [AthleteMetricsService],
})
export class AthleteMetricsModule {}
