/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaintenanceDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  officeId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsDateString()
  @ApiProperty()
  startDate: string;
}
