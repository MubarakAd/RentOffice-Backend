/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Role } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { MailerServiceWrapper } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerServiceWrapper,
  ) {}

  // Create a new user
  async signUp(createUserDto: CreateUserDto) {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new HttpException('User with this email already exists', 400);
    }
    const hashedPassword = bcrypt.hashSync(createUserDto.password, 10);
    createUserDto.password = hashedPassword;
    const newUser = await this.prisma.user.create({
      data: createUserDto,
    });
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async signIn(email: string, password: string) {
    const User = await this.validateUser(email, password);
    if (!User) {
      throw new HttpException('Invalid email or password', 401);
    }
    const tokens = await this.getTokens(User.id, User.email, User.role);
    const { password: pwd, ...userWithoutPassword } = User;
    return {
      ...tokens,
      userWithoutPassword,
    };
  }
  // Retrieve a user by ID
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        Rental: true,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // Retrieve a user by email
  // eslint-disable-next-line @typescript-eslint/require-await
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
  async getTokens(userId: number, email: string, role: Role) {
    const payload = { sub: userId, email, role };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7h',
    });
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
    return {
      access_token,
      refresh_token,
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    if (bcrypt.compareSync(pass, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
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
  async forgetPassword(email: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const token = randomBytes(32).toString('hex');
    const hashedToken = bcrypt.hashSync(token, 10);
    await this.prisma.resetPassword.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      },
    });
    const resetLink = `http://localhost:3000/auth/resetpassword?token=${token}`;
    await this.mailerService.sendResetPasswordEmail(user.email, resetLink);
    return { message: 'Password reset link sent to email' };
  }
  async resetPassword(token: string, newPassword: string) {
    const candidates = await this.prisma.resetPassword.findMany({
      where: { expiresAt: { gt: new Date() } },
    });
    const resetRecord = candidates.find((r) =>
      bcrypt.compareSync(token, r.token),
    );
    if (!resetRecord) {
      throw new NotFoundException('Invalid or expired password reset token');
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await this.prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });
    await this.prisma.resetPassword.deleteMany({
      where: { userId: resetRecord.userId },
    });
    return { message: 'Password has been reset successfully' };
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!bcrypt.compareSync(oldPassword, user.password)) {
      throw new UnauthorizedException('Old password is incorrect');
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    return { message: 'Password has been changed successfully' };
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
    });
  }

  // Get all admins
  async findAllAdmins() {
    return this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });
  }
}
