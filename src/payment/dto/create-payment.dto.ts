import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @IsNotEmpty()
  @ApiProperty()
  rentalId: string;

  @IsNotEmpty()
  @ApiProperty()
  amount: number;
}
