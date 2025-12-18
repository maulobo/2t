import { Controller, Get, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Probar manualmente la verificación de pagos próximos a vencer
  @Get('check-expiring')
  checkExpiring(@Query('days') days?: string) {
    const daysBeforeExpiration = days ? parseInt(days) : 3;
    return this.notificationsService.checkExpiringPaymentsManual(
      daysBeforeExpiration,
    );
  }

  // Ver pagos vencidos
  @Get('check-expired')
  checkExpired() {
    return this.notificationsService.checkExpiredPayments();
  }
}
