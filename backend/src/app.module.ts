import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AthletesModule } from './athletes/athletes.module';
import { PaymentsModule } from './payments/payments.module';
import { TrainingsModule } from './trainings/trainings.module';
import { ActivitiesModule } from './activities/activities.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MediaModule } from './media/media.module';
import { FeesModule } from './fees/fees.module';
import { AthleteActivitiesModule } from './athlete-activities/athlete-activities.module';
import { AthleteMetricsModule } from './athlete-metrics/athlete-metrics.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ForumsModule } from './forums/forums.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    AdminModule,
    UsersModule,
    AthletesModule,
    PaymentsModule,
    TrainingsModule,
    ActivitiesModule,
    NotificationsModule,
    MediaModule,
    FeesModule,
    AthleteActivitiesModule,
    AthleteMetricsModule,
    ForumsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
