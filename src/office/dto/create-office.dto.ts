import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { OfficeStatus } from '../entities/office.entity';

export class CreateOfficeDto {
  @IsNotEmpty()
  @IsString()
  officeNo: string;

  @IsNotEmpty()
  @IsString()
  officeArea: string; // Changed from GLfloat to number

  @IsNotEmpty()
  @IsNumber()
  floorNo: number;

  @IsNotEmpty()
  @IsEnum(OfficeStatus) // Validate against the OfficeStatus enum
  status: OfficeStatus;
}
