/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRentalDto } from './dto/create-rental.dto';

import { PrismaService } from 'src/prisma/prisma.service';

// Options used to query rentals (sorting, pagination and filters)
export interface FindRentalOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  filters?: {
    tenantId?: string | number;
    officeId?: string | number;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    rentAmountMin?: number | string;
    rentAmountMax?: number | string;
    q?: string; // free text search across related office/tenant
  };
}

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

  // Find rentals with optional filtering, sorting and pagination.
  // Find rentals with optional filtering, sorting and pagination.
  // If called without options, behavior matches previous implementation.
  async findAllRental(options?: FindRentalOptions) {
    // defaults
    const page =
      options?.page && options.page > 0
        ? Math.max(1, Math.floor(options.page))
        : 1;
    const limit =
      options?.limit && options.limit > 0
        ? Math.min(100, Math.floor(options.limit))
        : 10;
    const skip = (page - 1) * limit;

    // allowed sort fields on rental model (supports nested office/tenant fields)
    const allowedSortFields = [
      'id',
      'startDate',
      'endDate',
      'rentAmount',
      'officeNo',
      'tenantName',
    ];

    const sortBy =
      options?.sortBy && allowedSortFields.includes(options.sortBy)
        ? options.sortBy
        : 'id';
    const order: 'asc' | 'desc' = options?.order === 'asc' ? 'asc' : 'desc';

    // build where filter
    const where: any = {};

    const f = options?.filters;
    if (f) {
      if (
        f.tenantId !== undefined &&
        f.tenantId !== null &&
        f.tenantId !== ''
      ) {
        where.tenantId =
          typeof f.tenantId === 'string' ? parseInt(f.tenantId) : f.tenantId;
      }
      if (
        f.officeId !== undefined &&
        f.officeId !== null &&
        f.officeId !== ''
      ) {
        where.officeId =
          typeof f.officeId === 'string' ? parseInt(f.officeId) : f.officeId;
      }

      if (f.startDateFrom || f.startDateTo) {
        where.startDate = {};
        if (f.startDateFrom) where.startDate.gte = new Date(f.startDateFrom);
        if (f.startDateTo) where.startDate.lte = new Date(f.startDateTo);
      }
      if (f.endDateFrom || f.endDateTo) {
        where.endDate = {};
        if (f.endDateFrom) where.endDate.gte = new Date(f.endDateFrom);
        if (f.endDateTo) where.endDate.lte = new Date(f.endDateTo);
      }

      if (f.rentAmountMin !== undefined || f.rentAmountMax !== undefined) {
        where.rentAmount = {};
        if (
          f.rentAmountMin !== undefined &&
          f.rentAmountMin !== null &&
          f.rentAmountMin !== ''
        ) {
          where.rentAmount.gte =
            typeof f.rentAmountMin === 'string'
              ? parseFloat(f.rentAmountMin)
              : f.rentAmountMin;
        }
        if (
          f.rentAmountMax !== undefined &&
          f.rentAmountMax !== null &&
          f.rentAmountMax !== ''
        ) {
          where.rentAmount.lte =
            typeof f.rentAmountMax === 'string'
              ? parseFloat(f.rentAmountMax)
              : f.rentAmountMax;
        }
      }

      // free text search across related office and tenant fields
      if (f.q) {
        const q = f.q.trim();
        if (q.length > 0) {
          where.OR = [
            { office: { officeNo: { contains: q, mode: 'insensitive' } } },
            { office: { officeArea: { contains: q, mode: 'insensitive' } } },
            { tenant: { name: { contains: q, mode: 'insensitive' } } },
            { tenant: { email: { contains: q, mode: 'insensitive' } } },
            { tenant: { phone: { contains: q, mode: 'insensitive' } } },
          ];
        }
      }
    }

    // total count for pagination metadata
    const total = await this.prisma.rental.count({ where });

    // build orderBy object - supports nested ordering for office/tenant
    let orderBy: any;
    if (sortBy === 'officeNo') {
      orderBy = { office: { officeNo: order } };
    } else if (sortBy === 'tenantName') {
      orderBy = { tenant: { name: order } };
    } else {
      orderBy = { [sortBy]: order };
    }

    const rentals = await this.prisma.rental.findMany({
      where,
      include: {
        office: true,
        tenant: true,
        payment: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    return {
      data: rentals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
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
