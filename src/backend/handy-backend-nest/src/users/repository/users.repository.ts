import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';

import type { CreateUsuarioInput } from "../types/user.types";



@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService){}

    async createClient(data: CreateUsuarioInput ){
        return this.prisma.usuario.create({ data })
    }
}