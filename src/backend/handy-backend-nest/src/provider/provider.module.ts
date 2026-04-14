import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderRepository } from './repository/provider.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [],
  providers: [ProviderService, ProviderRepository, PrismaService],
  exports: [ProviderService],
})
export class ProviderModule {}
