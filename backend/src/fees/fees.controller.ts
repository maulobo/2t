import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FeesService } from './fees.service';

@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get()
  findAll(@Query('coachId') coachId?: string) {
    return this.feesService.findAll(coachId);
  }

  @Get('current')
  findCurrent(
    @Query('coachId') coachId?: string,
    @Query('activityType') activityType?: string,
  ) {
    return this.feesService.findCurrent(coachId, activityType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feesService.findOne(id);
  }

  @Post()
  create(
    @Body()
    createFeeDto: {
      amount: number;
      currency?: string;
      activityType: string;
      activityName: string;
      validFrom: string;
      validUntil?: string;
      isActive?: boolean;
      description?: string;
      coachId?: string;
    },
  ) {
    return this.feesService.create({
      ...createFeeDto,
      validFrom: new Date(createFeeDto.validFrom),
      validUntil: createFeeDto.validUntil
        ? new Date(createFeeDto.validUntil)
        : undefined,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateFeeDto: {
      amount?: number;
      currency?: string;
      activityType?: string;
      activityName?: string;
      validFrom?: string;
      validUntil?: string;
      isActive?: boolean;
      description?: string;
    },
  ) {
    return this.feesService.update(id, {
      ...updateFeeDto,
      validFrom: updateFeeDto.validFrom
        ? new Date(updateFeeDto.validFrom)
        : undefined,
      validUntil: updateFeeDto.validUntil
        ? new Date(updateFeeDto.validUntil)
        : undefined,
    });
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.feesService.activate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feesService.remove(id);
  }
}
