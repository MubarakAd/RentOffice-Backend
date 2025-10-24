/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { RentalService } from './rental.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma';

@Controller('rental')
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TENANT)
  @Post()
  async create(@Body() createRentalDto: CreateRentalDto, @Req() req: any) {
    const tenantId = await req.user.userId; // Assuming `req.user` contains the authenticated user's details
    return this.rentalService.createRental(tenantId, createRentalDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.rentalService.findAllRental();
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TENANT)
  @Get('my-rental')
  findOne(@Req() req: any) {
    const tenantId = req.user.userId;
    return this.rentalService.findSingleRental(tenantId);
  }
}
