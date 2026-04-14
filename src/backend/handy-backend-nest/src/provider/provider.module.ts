import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { ProviderRepository } from './repository/provider.repository';
import { PrismaService } from '../prisma/prisma.service';
import { HashProvider } from 'common/security/security.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProviderController],
  providers: [ProviderService, ProviderRepository, PrismaService, HashProvider],
  exports: [ProviderService],
})
export class ProviderModule {}
