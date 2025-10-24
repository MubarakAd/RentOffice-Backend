import { IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  rentalId: string;

  @IsNotEmpty()
  amount: number;
}
