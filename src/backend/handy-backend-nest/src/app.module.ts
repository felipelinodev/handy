import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ContratationsModule } from './contratations/contratations.module';
import { AnalysisModule } from './analysis/analysis.module';

@Module({
  imports: [UserModule, PrismaModule, ContratationsModule, AnalysisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}