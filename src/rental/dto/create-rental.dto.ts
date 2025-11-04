/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRentalDto {
  @IsString()
  @ApiProperty()
  officeId: string;

  @IsDateString()
  @ApiProperty()
  startDate: string;

  @IsDateString()
  @ApiProperty()
  endDate: string;
}
