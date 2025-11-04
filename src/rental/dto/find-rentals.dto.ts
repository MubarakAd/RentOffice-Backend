/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, IsInt, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FindRentalsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiProperty({ required: false })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiProperty({ required: false })
  limit?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  order?: 'asc' | 'desc';

  // filters
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  tenantId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  officeId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  startDateFrom?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  startDateTo?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  endDateFrom?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  endDateTo?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  rentAmountMin?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  rentAmountMax?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  q?: string;
}
