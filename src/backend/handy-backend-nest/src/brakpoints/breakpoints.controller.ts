import { BadRequestException, Body, Controller, Headers, Delete, Get, InternalServerErrorException, Param, ParseIntPipe, Post, UseGuards, Patch, NotFoundException } from '@nestjs/common';
import { BreakpointsService } from './breakpoints.service';
import { breakpointSchema } from './schemas/breakpoints.schema';
import { z } from "zod";

import type { CreateBreakpointDto } from './schemas/breakpoints.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('breakpoints')
export class BreakpointsController {

    constructor(
        private readonly breakpointsService: BreakpointsService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('create-new-breakpoints')
    async createNewBreakpoint(@Body() body: CreateBreakpointDto) {
        const result = breakpointSchema.safeParse(body);

        if (!result.success) {
            const flattened = z.flattenError(result.error).fieldErrors;
            const sliceErro = Object.values(flattened)[0][0];
            throw new BadRequestException(sliceErro);
        }

        try {
            return await this.breakpointsService.createBreakpoint(result.data as any);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('view-breakpoints/:id')
    async viewBreakpoints(@Param('id', ParseIntPipe) id: number) {
        const breakpoints = await this.breakpointsService.listBreakpointsByPrestador(id);

        if (!breakpoints) {
            throw new NotFoundException("Nenhum breakpoint encontrado.");
        }

        return breakpoints;
    }

    @UseGuards(JwtAuthGuard)
    @Patch('edit-a-breakpoint/:id')
    async editBreakpoint(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: any
    ) {
        const result = breakpointSchema.partial().safeParse(data);

        if (!result.success) {
            const flattened = z.flattenError(result.error).fieldErrors;
            const sliceErro = Object.values(flattened)[0][0];
            throw new BadRequestException(sliceErro);
        }

        try {
            return await this.breakpointsService.updateBreakpoint(id, data);
        } catch (error) {
            if (error.status) throw error;
            throw new InternalServerErrorException(error);
        }
    }

    @Delete('delete-a-breakpoint/:id')
    async deleteBreakpoint(
        @Param('id', ParseIntPipe) id: number,
        @Headers('admin-key') chave_admin: string
    ) {
        try {
            return await this.breakpointsService.deleteBreakpoint(id, chave_admin);
        } catch (error) {
            if (error.status) throw error;
            throw new InternalServerErrorException(error);
        }
    }
}
