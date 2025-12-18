import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(
    @Body()
    createPaymentDto: {
      athleteId: string;
      amount: number;
      periodStart: string;
      periodEnd: string;
      evidenceUrl?: string;
      evidenceText?: string;
      activityId?: string;
    },
  ) {
    return this.paymentsService.create({
      ...createPaymentDto,
      periodStart: new Date(createPaymentDto.periodStart),
      periodEnd: new Date(createPaymentDto.periodEnd),
    });
  }

  @Get('athlete/:athleteId')
  findByAthlete(@Param('athleteId') athleteId: string) {
    return this.paymentsService.findByAthlete(athleteId);
  }

  @Get('pending')
  findPending(@Query('coachId') coachId?: string) {
    return this.paymentsService.findPending(coachId);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.paymentsService.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.paymentsService.reject(id);
  }

  @Patch(':id/evidence')
  updateEvidence(
    @Param('id') id: string,
    @Body() body: { evidenceUrl: string; evidenceText?: string },
  ) {
    return this.paymentsService.updateEvidence(
      id,
      body.evidenceUrl,
      body.evidenceText,
    );
  }
}
