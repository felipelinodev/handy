import { Module } from '@nestjs/common';
import { ContratationController } from './contratation.controller';
import { ContratationService } from './contratation.service';
import { ContratationRepository } from './repository/contratations.repository';

@Module({
  controllers: [ContratationController],
  providers: [ContratationService, ContratationRepository],
})
export class ContratationsModule {}
