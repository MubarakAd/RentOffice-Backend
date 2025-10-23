import { HttpException, Injectable } from '@nestjs/common';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OfficeStatus } from './entities/office.entity';

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

  async findAllOffice() {
    return this.prisma.office.findMany();
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
