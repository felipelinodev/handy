import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';

import type { CreateUsuarioInput } from "../types/client.types";

export type BuscarPor = 'email' | 'user_id';

@Injectable()
export class ClientRepository {
    constructor(private readonly prisma: PrismaService){}
    
    async createClient(data: CreateUsuarioInput ){
        return await this.prisma.usuario.create({
            data: {
                ...data,
                cliente: {
                    create: {}
                }
            }
        });
    }

    async searchClient(campo: BuscarPor, valor: string | number) {
        return await this.prisma.usuario.findUnique({
            where: {
                [campo]: valor 
            }
        });
    }

    async deleteClient(email: string){
        return await this.prisma.usuario.delete({
            where: {
                email: email
            }
        })
    }

    async updateClient(id: number, data: any) {
        return await this.prisma.usuario.update({
            where: { user_id: id },
            data
        });
    }

    async findByZitadelId(zitadelId: string) {
        return await this.prisma.usuario.findUnique({
            where: { zitadel_id: zitadelId },
        });
    }

    async updateZitadelId(userId: number, zitadelId: string) {
        return await this.prisma.usuario.update({
            where: { user_id: userId },
            data: { zitadel_id: zitadelId },
        });
    }
    
}
