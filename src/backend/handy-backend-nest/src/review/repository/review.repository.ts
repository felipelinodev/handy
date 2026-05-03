import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateReviewInput } from "../types/review.types";

@Injectable()
export class ReviewRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createReview(data: CreateReviewInput) {
        return await this.prisma.avaliacao.create({
            data: {
                ...data,
            },
        });
    }

    async searchReview(campo: 'avaliacao_id', valor: number) {
        return await this.prisma.avaliacao.findUnique({
            where: {
                [campo]: valor,
            },
        });
    }

    async searchReviewByContratacao(contratacao_id: number) {
        return await this.prisma.avaliacao.findUnique({
            where: {
                contratacao_id: contratacao_id,
            },
        });
    }

    async listAllReviewsByPrestador(prestador_id: number) {
        return await this.prisma.avaliacao.findMany({
            where: {
                prestador_id: prestador_id,
            },
        });
    }

    async deleteReview(avaliacao_id: number) {
        return await this.prisma.avaliacao.delete({
            where: {
                avaliacao_id: avaliacao_id,
            },
        });
    }
}
