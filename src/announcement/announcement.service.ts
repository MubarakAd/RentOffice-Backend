import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}
  async createNewAnnouncement(createAnnouncementDto: CreateAnnouncementDto) {
    const announcement = await this.prisma.announcement.create({
      data: createAnnouncementDto,
    });
    return announcement;
  }
  async findAllAnnouncements() {
    const now = new Date();
    const announcements = await this.prisma.announcement.findMany({
      where: {
        expiryDate: { gte: now },
      },
    });
    return announcements;
  }

  async updateAnnouncement(
    id: number,
    updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    const existingAnnouncement = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!existingAnnouncement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return this.prisma.announcement.update({
      where: { id },
      data: updateAnnouncementDto,
    });
  }

  async removeAnnouncement(id: number) {
    const existingAnnouncement = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!existingAnnouncement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return this.prisma.announcement.delete({
      where: { id },
    });
  }
}
