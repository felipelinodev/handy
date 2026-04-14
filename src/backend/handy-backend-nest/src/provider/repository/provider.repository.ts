import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServicoInput, CreateUsuarioInput, UpdatePrestadorInput } from "../types/provider.types";

export type BuscarPor = 'email' | 'user_id';

@Injectable()
export class ProviderRepository {
    constructor(private readonly prisma: PrismaService){}

    async createProvider(data: CreateUsuarioInput){
        const { especialidades, ...userData } = data;

        return await this.prisma.usuario.create({
            data: {
                ...userData,
                prestador: {
                    create: {
                        prestador_especialidade: {
                            create: especialidades?.map(id => ({
                                especialidade_id: id
                            }))
                        }
                    }
                }
            },
            include: {
                prestador: {
                    include: {
                        prestador_especialidade: true
                    }
                }
            }
        })
    }

    async searchProvider(campo: BuscarPor, valor: string | number) {
        return await this.prisma.usuario.findUnique({
            where: {
                [campo]: valor 
            },
            include: {
                prestador: {
                    include: {
                        servicos: true,
                        prestador_especialidade: {
                            include: {
                                especialidade: true
                            }
                        },
                        avaliacao: true
                    }
                }
            }
        });
    }

    async listAllProviders(page: number = 1) {
        return await this.prisma.usuario.findMany({
            where: {
                tipo_usuario: 'PRESTADOR' 
            },
            take: 100,
            skip: (page - 1) * 100,
            include: {
                prestador: {
                    include: {
                        servicos: true
                    }
                }
            }
        });
    }

    async updateProvider(id: number, data: UpdatePrestadorInput) {
        const { media_avaliacao, total_clientes, ...userData } = data;

        return await this.prisma.usuario.update({
            where: { user_id: id },
            data: {
                ...userData,
                prestador: {
                    update: (media_avaliacao !== undefined || total_clientes !== undefined) ? {
                        media_avaliacao,
                        total_clientes
                    } : undefined
                }
            },
            include: {
                prestador: true
            }
        });
    }

    async deleteProvider(email: string) {
        return await this.prisma.usuario.delete({
            where: {
                email: email
            }
        });
    }

    async createService(serviceData: CreateServicoInput){
        
    }

}
