import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { createServiceSchema, updateServiceSchema } from './schemas/services.schema';
import { z } from "zod";
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import type { CreateServiceDto } from './schemas/services.schema';

@Controller('services')
export class ServicesController {

    constructor(
        private readonly servicesService: ServicesService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('create-new-service')
    async createNewService(@Body() body: CreateServiceDto) {
        const result = createServiceSchema.safeParse(body);

        if (!result.success) {
            const flattened = z.flattenError(result.error).fieldErrors;
            const sliceErro = Object.values(flattened)[0][0];
            throw new BadRequestException(sliceErro);
        }

        try {
            return await this.servicesService.createService(result.data);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch('edit-a-service/:id')
    async editAService(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: any
    ) {
        const result = updateServiceSchema.safeParse(data);

        if (!result.success) {
            const flattened = z.flattenError(result.error).fieldErrors;
            const sliceErro = Object.values(flattened)[0][0];
            throw new BadRequestException(sliceErro);
        }

        try {
            return await this.servicesService.updateService(id, result.data);
        } catch (error) {
            if (error.status) throw error;
            throw new InternalServerErrorException(error);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('list-all-services')
    async listAllServices(
        @Query('page') page: string = '1',
        @Query('name') name?: string
    ) {
        try {
            if (name) {
                return await this.servicesService.findServicesByName(name, Number(page) || 1);
            }
            return await this.servicesService.listAllServices(Number(page) || 1);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('list-a-service/:id')
    async listAService(@Param('id', ParseIntPipe) id: number) {
        const service = await this.servicesService.findServiceById(id);

        if (!service) {
            throw new NotFoundException("Serviço não foi encontrado.");
        }

        return service;
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete-a-service/:id')
    async deleteAService(@Param('id', ParseIntPipe) id: number) {
        try {
            return await this.servicesService.deleteService(id);
        } catch (error) {
            if (error.status) throw error;
            throw new InternalServerErrorException(error);
        }
    }
}
