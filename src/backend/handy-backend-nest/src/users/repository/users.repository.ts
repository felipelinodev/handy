import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';

import type { CreateUsuarioInput } from "../types/user.types";



@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService){}
    
    async createClient(data: CreateUsuarioInput ){
        return this.prisma.usuario.create({
            data: {
                ...data,
                cliente: {
                    create: {}
                }
            }
        });
    }

    async buscarUsuarioPorId(id: number){
        return this.prisma.usuario.findUnique({
            where:{
                user_id: id // O nome da coluna no banco é user_id!
            }
        })
    }
}