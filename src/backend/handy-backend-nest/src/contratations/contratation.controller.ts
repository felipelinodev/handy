import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseIntPipe, Post, UseGuards, Patch } from '@nestjs/common';
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

  @Post('create')
  create(@Body() body: CreateContratationDto){

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
  @Get('view/:id')
   async view(@Param('id', ParseIntPipe) id: number){
     return this.contratationService.viewContratation(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any
  ){
     return this.contratationService.updateContratation(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async excluir(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.contratationService.deleteContratation(id);
  }
}
