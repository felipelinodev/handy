import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicesRepository } from './repository/services.repository';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ServicesController],
  providers: [ServicesService, ServicesRepository, PrismaService],
  exports: [ServicesService],
})
export class ServicesModule {}
