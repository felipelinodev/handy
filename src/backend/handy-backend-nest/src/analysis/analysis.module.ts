import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { AnalysisRepository } from './repository/analysis.repository';

@Module({
    controllers: [AnalysisController],
    providers: [AnalysisService, AnalysisRepository],
})
export class AnalysisModule { }