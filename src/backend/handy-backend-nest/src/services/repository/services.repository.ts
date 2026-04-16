import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServicoInput, UpdateServicoInput } from "../types/services.types";

@Injectable()
export class ServicesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createService(data: CreateServicoInput) {
        return await this.prisma.servicos.create({
            data,
            include: {
                categoria: true,
                prestador: true
            }
        });
    }

    async findServiceById(id: number) {
        return await this.prisma.servicos.findUnique({
            where: {
                servico_id: id
            },
            include: {
                categoria: true,
                prestador: {
                    include: {
                        usuario: {
                            select: {
                                user_id: true,
                                nome: true,
                                email: true,
                                photo_url: true
                            }
                        }
                    }
                }
            }
        });
    }

    async findServicesByName(name: string, page: number = 1) {
        return await this.prisma.servicos.findMany({
            where: {
                nome_servico: {
                    contains: name,
                    mode: 'insensitive'
                }
            },
            take: 100,
            skip: (page - 1) * 100,
            include: {
                categoria: true,
                prestador: {
                    include: {
                        usuario: {
                            select: {
                                user_id: true,
                                nome: true,
                                email: true,
                                photo_url: true
                            }
                        }
                    }
                }
            }
        });
    }

    async listAllServices(page: number = 1) {
        return await this.prisma.servicos.findMany({
            take: 100,
            skip: (page - 1) * 100,
            include: {
                categoria: true,
                prestador: {
                    include: {
                        usuario: {
                            select: {
                                nome: true,
                                email: true,
                                photo_url: true
                            }
                        }
                    }
                }
            }
        });
    }

    async updateService(id: number, data: UpdateServicoInput) {
        return await this.prisma.servicos.update({
            where: { servico_id: id },
            data,
            include: {
                categoria: true,
                prestador: true
            }
        });
    }

    async deleteService(id: number) {
        return await this.prisma.servicos.delete({
            where: {
                servico_id: id
            }
        });
    }
}
