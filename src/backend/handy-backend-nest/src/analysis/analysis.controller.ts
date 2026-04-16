import { BadRequestException, Controller, Get, InternalServerErrorException, Query, UseGuards } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { analysisRequestSchema } from './schema/analysis.schema';
import { z } from 'zod';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) { }

  private validateQuery(query: unknown) {
    const result = analysisRequestSchema.safeParse(query);

    if (!result.success) {
      const flattened = z.flattenError(result.error).fieldErrors;
      const sliceErro = Object.values(flattened)[0][0];
      throw new BadRequestException(sliceErro);
    }

    return result.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('contracted-services')
  async getContractedServices(@Query() query: unknown) {
    const data = this.validateQuery(query);

    try {
      return this.analysisService.getContractedServicesAnalysis(data.prestador_id, data.periodo);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('revenue-services')
  async getRevenueServices(@Query() query: unknown) {
    const data = this.validateQuery(query);

    try {
      return this.analysisService.getRevenueAnalysis(data.prestador_id, data.periodo);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-performance')
  async getPerformance(@Query() query: unknown) {
    const data = this.validateQuery(query);

    try {
      return this.analysisService.getPerformanceAnalysis(data.prestador_id, data.periodo);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('list-service-provider-clients')
  async listServiceProviderClients(@Query() query: unknown) {
    const data = this.validateQuery(query);

    try {
      return this.analysisService.listServiceProviderClients(data.prestador_id, data.periodo);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}