/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRentalDto } from './dto/create-rental.dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RentalService {
  constructor(private readonly prisma: PrismaService) {}

  async createRental(tenantId: string, createRentalDto: CreateRentalDto) {
    const checkOffice = await this.prisma.office.findUnique({
      where: { id: parseInt(createRentalDto.officeId) },
    });

    if (!checkOffice || checkOffice.status !== 'available') {
      throw new NotFoundException('Office is not available for rent');
    }

    const rental = await this.prisma.rental.create({
      data: {
        officeId: parseInt(createRentalDto.officeId),
        tenantId: parseInt(tenantId),
        startDate: new Date(createRentalDto.startDate),
        endDate: new Date(createRentalDto.endDate),
        rentAmount: checkOffice.rentAmount,
      },
    });

    await this.prisma.office.update({
      where: { id: parseInt(createRentalDto.officeId) },
      data: { status: 'rented' },
    });
    return rental;
  }

  async findAllRental() {
    const rentals = await this.prisma.rental.findMany({
      include: {
        office: true,
        tenant: true,
        payment: true,
      },
    });
    return rentals;
  }

  async findSingleRental(tenantId: string) {
    const rental = await this.prisma.rental.findFirst({
      where: { tenantId: parseInt(tenantId) },
      include: {
        office: true,
        tenant: true,
      },
    });

    if (!rental) {
      throw new NotFoundException(`No rental found for tenant ID ${tenantId}`);
    }

    return rental;
  }
}
