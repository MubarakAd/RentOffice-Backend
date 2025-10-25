/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerServiceWrapper } from 'src/mailer/mailer.service';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private mailer: MailerServiceWrapper,
  ) {}
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
    const tenant = await this.prisma.user.findUnique({
      where: { id: tenantId },
    });

    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    const maintenance = await this.prisma.maintenance.create({
      data: {
        description: createMaintenanceDto.description,
        startDate: new Date(createMaintenanceDto.startDate),
        officeId: createMaintenanceDto.officeId,
        tenantId: tenantId,
        status: 'open',
      },
    });
    if (admin && tenant) {
      await this.mailer.sendMaintenanceRequestEmail(
        admin.email,
        tenant.name || 'Tenant',
        createMaintenanceDto.officeId,
      );
    }

    return maintenance;
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
    const updatedMaintenance = await this.prisma.maintenance.update({
      where: { id },
      data: {
        ...updateMaintenanceDto,
        status: updateMaintenanceDto.status,
      },
    });
    const tenantId = maintenance.tenantId;
    if (updateMaintenanceDto.status === 'resolved' && tenantId) {
      const tenant = await this.prisma.user.findUnique({
        where: { id: tenantId },
      });
      if (tenant) {
        await this.mailer.sendMaintenanceCompletedEmail(
          tenant.email,
          updatedMaintenance.officeId,
        );
      }
    }
    return updatedMaintenance;
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
