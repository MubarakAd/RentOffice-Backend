import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMaintenanceDto {
  @IsInt()
  @IsNotEmpty()
  officeId: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  startDate: string;
}
