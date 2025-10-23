import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

import { PrismaModule } from './prisma/prisma.module';
// import { JwtModule } from '@nestjs/jwt';
import { RentalModule } from './rental/rental.module';
import { OfficeModule } from './office/office.module';

@Module({
  imports: [AuthModule, PrismaModule, RentalModule, OfficeModule],
})
export class AppModule {}
