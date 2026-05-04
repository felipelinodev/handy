import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ReviewRepository } from "./repository/review.repository";
import { CreateReviewInput } from "./types/review.types";

@Injectable()
export class ReviewService {
    constructor(
        private readonly reviewRepository: ReviewRepository
    ) {}

    async createReview(data: CreateReviewInput) {
        const existingReview = await this.reviewRepository.searchReviewByContratacao(data.contratacao_id);
        if (existingReview) {
            throw new Error("Já existe uma avaliação para esta contratação.");
        }

        const review = await this.reviewRepository.createReview(data);
        return { message: "Avaliação criada com sucesso.", review };
    }

    async searchReviewById(id: number) {
        return this.reviewRepository.searchReview('avaliacao_id', id);
    }

    async listAllReviewsByPrestador(prestador_id: number) {
        return this.reviewRepository.listAllReviewsByPrestador(prestador_id);
    }

    async deleteReview(id: number) {
        const review = await this.searchReviewById(id);
        if (!review) {
            throw new NotFoundException("Avaliação não encontrada.");
        }

        await this.reviewRepository.deleteReview(id);
        return {
            message: "Avaliação excluída com sucesso!",
            review,
        };
    }
}
