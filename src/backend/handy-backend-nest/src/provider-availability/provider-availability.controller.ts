import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseIntPipe, Post, Patch, UseGuards } from '@nestjs/common';
import { ProviderAvailabilityService } from './provider-availability.service';
import { createProviderAvailabilitySchema, updateProviderAvailabilitySchema } from './schemas/provider-availability.schema';
import { z } from "zod";

import type { CreateProviderAvailabilityDto, UpdateProviderAvailabilityDto } from './schemas/provider-availability.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('provider-availability')
export class ProviderAvailabilityController {

  constructor(
    private readonly providerAvailabilityService: ProviderAvailabilityService
  ) {}

  @Post('create')
  createAvailability(@Body() body: CreateProviderAvailabilityDto) {

    const result = createProviderAvailabilitySchema.safeParse(body);

    if (!result.success) {
      const flattened = z.flattenError(result.error).fieldErrors;
      const sliceErro = Object.values(flattened)[0][0];
      throw new BadRequestException(sliceErro);
    }

    try {
      return this.providerAvailabilityService.createAvailability(result.data);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Post('create-many')
  createManyAvailability(@Body() body: CreateProviderAvailabilityDto[]) {

    const validated: any[] = [];

    for (const item of body) {
      const result = createProviderAvailabilitySchema.safeParse(item);
      if (!result.success) {
        const flattened = z.flattenError(result.error).fieldErrors;
        const sliceErro = Object.values(flattened)[0][0];
        throw new BadRequestException(sliceErro);
      }
      validated.push(result.data);
    }

    try {
      return this.providerAvailabilityService.createManyAvailability(validated);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('view/:id')
  async viewAvailability(@Param('id', ParseIntPipe) id: number) {
    try {
      return this.providerAvailabilityService.viewAvailability(id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('provider/:prestadorId')
  async viewProviderSchedule(@Param('prestadorId', ParseIntPipe) prestadorId: number) {
    try {
      return this.providerAvailabilityService.viewProviderSchedule(prestadorId);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('provider/:prestadorId/free')
  async viewProviderFreeSlots(@Param('prestadorId', ParseIntPipe) prestadorId: number) {
    try {
      return this.providerAvailabilityService.viewProviderFreeSlots(prestadorId);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('view-all')
  async viewAllAvailabilities() {
    try {
      return this.providerAvailabilityService.viewAllAvailabilities();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  async updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProviderAvailabilityDto
  ) {

    const result = updateProviderAvailabilitySchema.safeParse(body);

    if (!result.success) {
      const flattened = z.flattenError(result.error).fieldErrors;
      const sliceErro = Object.values(flattened)[0][0];
      throw new BadRequestException(sliceErro);
    }

    try {
      return this.providerAvailabilityService.updateAvailability(id, result.data);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reserve/:id')
  async reserveSlot(
    @Param('id', ParseIntPipe) id: number,
    @Body('contratacao_id', ParseIntPipe) contratacaoId: number
  ) {
    try {
      return this.providerAvailabilityService.reserveSlot(id, contratacaoId);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteAvailability(@Param('id', ParseIntPipe) id: number) {
    try {
      return this.providerAvailabilityService.deleteAvailability(id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
