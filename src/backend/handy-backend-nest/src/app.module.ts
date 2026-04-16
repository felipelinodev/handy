import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client/client.module';
import { ProviderModule } from './provider/provider.module';
import { PrismaModule } from './prisma/prisma.module';
import { ContratationsModule } from './contratations/contratations.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [ClientModule, ProviderModule, PrismaModule, ContratationsModule, AnalysisModule, ServicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
