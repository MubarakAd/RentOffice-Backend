/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new user
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  // Retrieve all users with their rentals and maintenance records
  async findAll() {
    return this.prisma.user.findMany({
      include: {
        Rental: true,
        Maintenance: true,
      },
    });
  }

  // Retrieve a user by ID
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        Rental: true,
        Maintenance: true,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // Retrieve a user by email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Update user details
  async update(id: number, updateUserDto: UpdateUserDto) {
    const checkUser = await this.findOne(id);
    if (!checkUser) {
      throw new Error('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  // Remove a user
  async remove(id: number) {
    const checkUser = await this.findOne(id);
    if (!checkUser) {
      throw new Error('User not found');
    }
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // Assign a role to a user
  async assignRole(id: number, role: 'ADMIN' | 'TENANT') {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  // Get all tenants
  async findAllTenants() {
    return this.prisma.user.findMany({
      where: { role: 'TENANT' },
      include: {
        Rental: true,
      },
    });
  }

  // Get all admins
  async findAllAdmins() {
    return this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });
  }

  // Get user rentals
  async getUserRentals(userId: number) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.prisma.rental.findMany({
      where: { tenantId: userId },
      include: {
        office: true,
        payment: true,
      },
    });
  }

  // Get user maintenance requests
  async getUserMaintenanceRequests(userId: number) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.prisma.maintenance.findMany({
      where: { tenantId: userId },
      include: {
        office: true,
      },
    });
  }
}
