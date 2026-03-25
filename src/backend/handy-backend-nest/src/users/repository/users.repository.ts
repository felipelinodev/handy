import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';

import type { CreateUsuarioInput } from "../types/user.types";

export type BuscarPor = 'email' | 'user_id';

@Injectable()
export class UserRepository {
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

    async buscarUsuario(campo: BuscarPor, valor: string | number) {
        return await this.prisma.usuario.findUnique({
            where: {
                [campo]: valor 
            }
        });
    }

    async deletarUsuario(email: string){
        return await this.prisma.usuario.delete({
            where: {
                email: email
            }
        })
    }

    async atualizarUsuario(id: number, data: any) {
        return await this.prisma.usuario.update({
            where: { user_id: id },
            data
        });
    }
    
}
