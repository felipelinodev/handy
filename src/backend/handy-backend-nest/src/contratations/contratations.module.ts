import { Module } from '@nestjs/common';
import { ContratationController } from './contratation.controller';
import { ContratationService } from './contratation.service';
import { ContratationRepository } from './repository/contratations.repository';
import { AutentiqueModule } from './integrations/autentique/autentique.module';
import { PdfService } from './integrations/pdf/pdf.service';

@Module({
  imports: [AutentiqueModule],
  controllers: [ContratationController],
  providers: [ContratationService, ContratationRepository, PdfService],
})
export class ContratationsModule {}
