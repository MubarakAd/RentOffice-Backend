import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async processPayment(createPaymentDto: CreatePaymentDto) {
    const { rentalId, amount } = createPaymentDto;
    const payment = await this.prisma.payment.create({
      data: {
        rentalId: parseInt(rentalId),
        amount: amount,
        status: 'payed',
      },
    });
    return payment;
  }

  // Here you would add your payment processing logic
  // For example, you might call a payment gateway API
}
