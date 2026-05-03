import { BadRequestException, Body, Controller, Headers, Delete, Get, InternalServerErrorException, Param, ParseIntPipe, Post, UseGuards, NotFoundException } from '@nestjs/common';
import { ReviewService } from './review.service';
import { reviewSchema } from './schemas/review.schema';
import { z } from "zod";

import type { CreateReviewDto } from './schemas/review.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('review')
export class ReviewController {

    constructor(
        private readonly reviewService: ReviewService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('create-new-review')
    async createNewAvaliation(@Body() body: CreateReviewDto) {
        const result = reviewSchema.safeParse(body);

        if (!result.success) {
            const flattened = z.flattenError(result.error).fieldErrors;
            const sliceErro = Object.values(flattened)[0][0];
            throw new BadRequestException(sliceErro);
        }

        try {
            return await this.reviewService.createReview(result.data as any);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('view-all-review/:id')
    async viewAllAvaliation(@Param('id', ParseIntPipe) id: number) {
        const reviews = await this.reviewService.listAllReviewsByPrestador(id);

        if (!reviews) {
            throw new NotFoundException("Nenhuma avaliação encontrada.");
        }

        return reviews;
    }

    @Delete('delete-a-review/:id')
    async deleteAvaliation(
        @Param('id', ParseIntPipe) id: number,
        @Headers('admin-key') chave_admin: string
    ) {
        try {
            return await this.reviewService.deleteReview(id, chave_admin);
        } catch (error) {
            if (error.status) throw error;
            throw new InternalServerErrorException(error);
        }
    }
}
