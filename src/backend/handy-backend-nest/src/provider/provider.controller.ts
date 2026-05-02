import { BadRequestException, Body, Controller, Headers, Delete, Get, InternalServerErrorException, Param, ParseIntPipe, Post, Query, UseGuards, Patch, NotFoundException } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { providerSchema } from './schemas/provider.schema';
import { z } from "zod";

import type { CreateProviderDto } from './schemas/provider.schema';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('provider')
export class ProviderController {

    constructor(
        private readonly providerService: ProviderService,
        private readonly jwtService: JwtService
    ) { }

    @Post('create-service-provider-account')
    async createServiceProviderAccount(@Body() body: CreateProviderDto) {
        const result = providerSchema.safeParse(body);

        if (!result.success) {
            const flattened = z.flattenError(result.error).fieldErrors;
            const sliceErro = Object.values(flattened)[0][0];
            throw new BadRequestException(sliceErro);
        }

        try {
            return await this.providerService.createServiceProvider(result.data as any);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('list-service-providers')
    async listServiceProviders(@Query('page') page?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        try {
            return await this.providerService.listServiceProviders(pageNumber);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('especialidades')
    async listEspecialidades() {
        try {
            return await this.providerService.listEspecialidades();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('view-service-provider/:id')
    async getServiceProviderInfos(@Param('id', ParseIntPipe) id: number) {
        const providerExists = await this.providerService.searchServiceProviderById(id);

        if (!providerExists) {
            throw new NotFoundException("Prestador não foi encontrado.");
        }

        return providerExists;
    }

    @UseGuards(JwtAuthGuard)
    @Patch('update-service-provider/:id')
    async updateServiceProvider(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: any
    ) {
        const result = providerSchema.partial().safeParse(data);

        if (!result.success) {
            const flattened = z.flattenError(result.error).fieldErrors;
            const sliceErro = Object.values(flattened)[0][0];
            throw new BadRequestException(sliceErro);
        }

        try {
            return await this.providerService.updateServiceProvider(id, data);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('login-service-provider')
    async loginServiceProvider(@Body() body: any) {
        const { email, senha } = body;

        try {
            const user = await this.providerService.validateAccess(email, senha);
            const payload = { email: user.email, user_id: user.user_id };

            const { hash_password, cpf, ...userNotPassword } = user as any;

            return {
                accessToken: this.jwtService.sign(payload),
                user: userNotPassword
            };
        } catch (error) {
            if (error.status) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao tentar realizar o login.');
        }
    }


    @Delete('delete-a-service-provider/:email')
    async deleteServiceProvider(
        @Param('email') email: string,
        @Headers('admin-key') chave_admin: string
    ) {
        try {
            return await this.providerService.deleteUserAccount(email, chave_admin);
        } catch (error) {
            if (error.status) throw error;
            throw new InternalServerErrorException(error);
        }
    }
}
