import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ReviewRepository } from "./repository/review.repository";
import { CreateReviewInput } from "./types/review.types";

@Injectable()
export class ReviewService {
    constructor(
        private readonly reviewRepository: ReviewRepository
    ) {}

    async createReview(data: CreateReviewInput) {
        const review = await this.reviewRepository.createReview(data);
        return { message: "Avaliação criada com sucesso.", review };
    }

    async searchReviewById(id: number) {
        return this.reviewRepository.searchReview('avaliacao_id', id);
    }

    async listAllReviewsByPrestador(prestador_id: number) {
        return this.reviewRepository.listAllReviewsByPrestador(prestador_id);
    }

    async deleteReview(id: number, chaveAdmin: string) {
        if (chaveAdmin !== process.env.CHAVE_ADMIN) {
            throw new UnauthorizedException("Você não tem permissão para excluir esta avaliação.");
        }

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
