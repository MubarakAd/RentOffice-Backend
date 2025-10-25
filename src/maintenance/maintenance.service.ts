import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}
  async createMaintenance(
    tenantId: number,
    createMaintenanceDto: CreateMaintenanceDto,
  ) {
    const office = await this.prisma.office.findUnique({
      where: { id: createMaintenanceDto.officeId },
    });
    if (!office) {
      throw new Error('Office not found');
    }
    return this.prisma.maintenance.create({
      data: {
        description: createMaintenanceDto.description,
        startDate: new Date(createMaintenanceDto.startDate),
        officeId: createMaintenanceDto.officeId,
        tenantId: tenantId,
        status: 'open',
      },
    });
  }
  async updateMaintenance(
    id: number,
    updateMaintenanceDto: UpdateMaintenanceDto,
  ) {
    const maintenance = await this.prisma.maintenance.findUnique({
      where: { id },
    });
    if (!maintenance) {
      throw new NotFoundException('Maintenance request not found');
    }
    return this.prisma.maintenance.update({
      where: { id },
      data: {
        ...updateMaintenanceDto,
        status: updateMaintenanceDto.status,
      },
    });
  }

  async getTenantRequests(tenantId: number) {
    return this.prisma.maintenance.findMany({
      where: { tenantId },
      include: { Office: true },
    });
  }

  async getAllMaintenance() {
    const maintenances = await this.prisma.maintenance.findMany({
      include: { Office: true, User: true },
    });
    return maintenances;
  }
}
