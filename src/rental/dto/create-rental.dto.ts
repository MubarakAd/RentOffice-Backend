import { IsDateString, IsString } from 'class-validator';

export class CreateRentalDto {
  @IsString()
  officeId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
