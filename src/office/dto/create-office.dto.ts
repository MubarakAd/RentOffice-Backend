/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { OfficeStatus } from '../enums/office.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOfficeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  officeNo: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  officeArea: string; // Changed from GLfloat to number

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  floorNo: number;

  @IsNotEmpty()
  @IsEnum(OfficeStatus) // Validate against the OfficeStatus enum
  @ApiProperty()
  status: OfficeStatus;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  rentAmount: number;
}
