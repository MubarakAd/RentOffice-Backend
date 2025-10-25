import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerServiceWrapper {
  constructor(private readonly mailerService: MailerService) {}

  async sendMaintenanceRequestEmail(
    adminEmail: string,
    tenantName: string,
    officeId: number,
  ) {
    await this.mailerService.sendMail({
      to: adminEmail,
      subject: 'New Maintenance Request',
      text: `Tenant ${tenantName} has submitted a maintenance request for Office #${officeId}.`,
    });
  }

  async sendMaintenanceCompletedEmail(tenantEmail: string, officeId: number) {
    await this.mailerService.sendMail({
      to: tenantEmail,
      subject: 'Maintenance Completed',
      text: `Your maintenance request for Office #${officeId} has been completed. Thank you for your patience.`,
    });
  }
}
