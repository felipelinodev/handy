import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';

import type { CreateContratationInput } from "../types/contratation.types";

export type BuscarPor = 'contratacao_id';

@Injectable()
export class ContratationRepository {
    constructor(private readonly prisma: PrismaService){}
    
    async createContratation(data: CreateContratationInput ){
        return await this.prisma.contratacoes.create({
            data
        });
    }

    async buscarContratacao(campo: BuscarPor, valor: number) {
        return await this.prisma.contratacoes.findUnique({
            where: {
                [campo]: valor 
            }
        });
    }

    async buscarTodasContratacoes() {
        return await this.prisma.contratacoes.findMany({
            include: { avaliacao: true }
        });
    }

    async deletarContratacao(id: number){
        return await this.prisma.contratacoes.delete({
            where: {
                contratacao_id: id
            }
        })
    }

    async atualizarContratacao(id: number, data: any) {
        return await this.prisma.contratacoes.update({
            where: { contratacao_id: id },
            data
        });
    }
}
