import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Headers, Param, ParseIntPipe, Post, UseGuards, Patch } from '@nestjs/common';
import { ContratationService } from './contratation.service';
import { contratationSchema } from './schemas/contratation.schema';
import { z } from "zod";

import type { CreateContratationDto } from './schemas/contratation.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('contratations')
export class ContratationController {
  
  constructor(
    private readonly contratationService: ContratationService
  ) {}

  @Post('create-a-contratation')
  createContratation(@Body() body: CreateContratationDto){

    const result = contratationSchema.safeParse(body)

    if(!result.success){
        const flattened  = z.flattenError(result.error).fieldErrors
        const sliceErro = Object.values(flattened)[0][0]
        throw new BadRequestException(sliceErro)
    }

    try {
      return this.contratationService.createContratation(result.data);
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
    
  }

  @UseGuards(JwtAuthGuard)
  @Get('view-a-contract/:id')
  async viewContratation(@Param('id', ParseIntPipe) id: number){
    try {
      return this.contratationService.viewContratation(id);
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('view-all-contracts')
  async viewAllContracts(){
    try {
      return this.contratationService.viewAllContratations();
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  async updateContratation(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any
  ){
    try {
      return this.contratationService.updateContratation(id, data);
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  @Delete('cancel-a-contratation/:id')
  async cancelContratation(
    @Param('id', ParseIntPipe) id: number,
    @Headers('admin-key') chave_admin: string
  ) {
    try {
      return this.contratationService.cancelContratation(id, chave_admin);
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}
