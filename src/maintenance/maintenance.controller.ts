/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'generated/prisma';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TENANT)
  @Post()
  @ApiOperation({ summary: 'Create maintenance request (tenant)' })
  @ApiResponse({ status: 201, description: 'Maintenance request created' })
  create(@Body() createMaintenanceDto: CreateMaintenanceDto, @Req() req: any) {
    const tenantId = req.user.userId;
    return this.maintenanceService.createMaintenance(
      tenantId,
      createMaintenanceDto,
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TENANT)
  @Get('/tenantRequests')
  @ApiOperation({ summary: 'Get tenant maintenance requests' })
  @ApiResponse({ status: 200, description: 'Tenant maintenance requests' })
  findTenantRequests(@Req() req: any) {
    const tenantId = req.user.userId;
    return this.maintenanceService.getTenantRequests(tenantId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('allMaintenance')
  @ApiOperation({ summary: 'Get all maintenance requests (admin)' })
  @ApiResponse({ status: 200, description: 'All maintenance requests' })
  getAllMaintenance() {
    return this.maintenanceService.getAllMaintenance();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update maintenance request (admin)' })
  @ApiResponse({ status: 200, description: 'Maintenance updated' })
  updateMaintenance(
    @Param('id') id: string,
    @Body() updateMaintenanceDto: UpdateMaintenanceDto,
  ) {
    return this.maintenanceService.updateMaintenance(+id, updateMaintenanceDto);
  }
}
