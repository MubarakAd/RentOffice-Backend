/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  expiryDate: string;
}
