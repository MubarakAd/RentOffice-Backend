import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { MailerServiceWrapper } from 'src/mailer/mailer.service';

@Module({
  controllers: [MaintenanceController],
  providers: [MaintenanceService, MailerServiceWrapper],
})
export class MaintenanceModule {}
