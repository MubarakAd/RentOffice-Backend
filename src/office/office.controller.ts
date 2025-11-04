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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OfficeService } from './office.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { FindOfficesDto } from './dto/find-offices.dto';

@ApiTags('office')
@Controller('office')
export class OfficeController {
  constructor(private readonly officeService: OfficeService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create an office (admin)' })
  @ApiResponse({ status: 201, description: 'Office created' })
  create(@Body() createOfficeDto: CreateOfficeDto) {
    return this.officeService.createOffice(createOfficeDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List offices' })
  @ApiResponse({ status: 200, description: 'List of offices' })
  findAll(@Query() query: FindOfficesDto) {
    return this.officeService.findAllOffice(query);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get office by id' })
  @ApiResponse({ status: 200, description: 'Office details' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.officeService.findOne(+id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an office (admin)' })
  @ApiResponse({ status: 200, description: 'Office updated' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOfficeDto: UpdateOfficeDto,
  ) {
    return this.officeService.updateOffice(+id, updateOfficeDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an office (admin)' })
  @ApiResponse({ status: 200, description: 'Office removed' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.officeService.removeOffice(+id);
  }
}
