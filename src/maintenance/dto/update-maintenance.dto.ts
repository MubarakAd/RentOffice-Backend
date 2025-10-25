import { PartialType } from '@nestjs/mapped-types';
import { CreateMaintenanceDto } from './create-maintenance.dto';
import { MaintenanceStatus } from '../entities/maintenance.entity';
import { IsEnum } from 'class-validator';

export class UpdateMaintenanceDto extends PartialType(CreateMaintenanceDto) {
  @IsEnum(MaintenanceStatus)
  status: MaintenanceStatus;
}
