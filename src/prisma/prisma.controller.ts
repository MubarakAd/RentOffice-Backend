import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('prisma')
@Controller('prisma')
export class PrismaController {}
