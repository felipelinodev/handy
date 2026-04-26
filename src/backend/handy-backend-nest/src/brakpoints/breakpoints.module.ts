import { Module } from '@nestjs/common';
import { BreakpointsService } from './breakpoints.service';
import { BreakpointsController } from './breakpoints.controller';
import { BreakpointsRepository } from './repository/breakpoints.repository';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BreakpointsController],
  providers: [BreakpointsService, BreakpointsRepository, PrismaService],
  exports: [BreakpointsService],
})
export class BreakpointsModule {}
