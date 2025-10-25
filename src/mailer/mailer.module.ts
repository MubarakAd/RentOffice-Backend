import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailerServiceWrapper } from './mailer.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // You can use any provider (e.g., Outlook, SendGrid)
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"RentOffice" <no-reply@rentoffice.com>',
      },
    }),
  ],
  providers: [MailerServiceWrapper],
  exports: [MailerServiceWrapper], // Ensure the wrapper service is exported
})
export class CustomMailerModule {} // Renamed to avoid conflict
