import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('announcement')
@Controller('announcement')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  @ApiOperation({ summary: 'Create announcement (admin)' })
  @ApiResponse({ status: 201, description: 'Announcement created' })
  create(@Body() createAnnouncementDto: CreateAnnouncementDto) {
    return this.announcementService.createNewAnnouncement(
      createAnnouncementDto,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all announcements' })
  @ApiResponse({ status: 200, description: 'List of announcements' })
  findAll() {
    return this.announcementService.findAllAnnouncements();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch(':id')
  @ApiOperation({ summary: 'Update announcement (admin)' })
  @ApiResponse({ status: 200, description: 'Announcement updated' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    return this.announcementService.updateAnnouncement(
      +id,
      updateAnnouncementDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete announcement (admin)' })
  @ApiResponse({ status: 200, description: 'Announcement removed' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.announcementService.removeAnnouncement(id);
  }
}
