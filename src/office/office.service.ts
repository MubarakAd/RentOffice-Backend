/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, Injectable } from '@nestjs/common';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OfficeStatus } from './enums/office.entity';
import { FindOfficesDto } from './dto/find-offices.dto';

@Injectable()
export class OfficeService {
  constructor(private readonly prisma: PrismaService) {}
  async createOffice(createOfficeDto: CreateOfficeDto) {
    const newOffice = await this.prisma.office.findUnique({
      where: { officeNo: createOfficeDto.officeNo },
    });
    if (newOffice) {
      throw new HttpException(
        'Office with this office number already exists',
        401,
      );
    }
    // Ensure the status value matches the Prisma OfficeStatus enum
    const data = {
      ...createOfficeDto,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      status: createOfficeDto.status as OfficeStatus,
    };
    return this.prisma.office.create({ data });
  }

  /**
   * Find offices with filtering, sorting and pagination.
   *
   * Supported options:
   * - page, limit: pagination (defaults page=1, limit=10)
   * - sortBy, order: sorting (order = 'asc'|'desc')
   * - status: OfficeStatus filter
   * - minRent, maxRent: rentAmount range
   * - officeNo: exact match
   * - search: text search on officeNo and officeArea (contains)
   * - floorNo: exact floor number
   */
  async findAllOffice(options?: FindOfficesDto) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, Math.min(100, options?.limit ?? 10));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, any> = {};

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.floorNo) {
      where.floorNo = options.floorNo;
    }

    if (options?.officeNo) {
      where.officeNo = options.officeNo;
    }

    if (
      typeof options?.minRent === 'number' ||
      typeof options?.maxRent === 'number'
    ) {
      where.rentAmount = {} as any;
      if (typeof options?.minRent === 'number')
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (where.rentAmount as any).gte = options.minRent;
      if (typeof options?.maxRent === 'number')
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (where.rentAmount as any).lte = options.maxRent;
    }

    if (options?.search) {
      // simple OR search on officeNo and officeArea
      where.OR = [
        { officeNo: { contains: options.search, mode: 'insensitive' } },
        { officeArea: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    // Validate sortBy
    const allowedSortFields = [
      'id',
      'officeNo',
      'floorNo',
      'rentAmount',
      'officeArea',
      'status',
    ];
    const sortByField =
      typeof options?.sortBy === 'string' &&
      allowedSortFields.includes(options.sortBy)
        ? options.sortBy
        : 'id';
    const order: 'asc' | 'desc' =
      (options?.order ?? 'asc') === 'desc' ? 'desc' : 'asc';

    const [total, data] = await Promise.all([
      this.prisma.office.count({ where }),
      this.prisma.office.findMany({
        where,
        // dynamic orderBy - cast to any to keep typing simple
        orderBy: { [sortByField]: order } as any,
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: number) {
    const office = await this.prisma.office.findUnique({
      where: { id },
    });
    if (!office) {
      throw new HttpException('Office not found', 404);
    }
    return office;
  }

  async updateOffice(id: number, updateOfficeDto: UpdateOfficeDto) {
    const toUpdate = await this.findOne(id);
    if (!toUpdate) {
      throw new HttpException('Office not found', 404);
    }
    await this.prisma.office.update({
      where: { id },
      data: {
        ...updateOfficeDto,
        status: updateOfficeDto.status as OfficeStatus,
      },
    });
  }

  async removeOffice(id: number) {
    const toDelete = await this.findOne(id);
    if (!toDelete) {
      throw new HttpException('Office not found', 404);
    }
    await this.prisma.office.delete({
      where: { id },
    });
  }
}
