import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';


export type BuscarPor = 'email' | 'user_id';

@Injectable()
export class ProviderRepository {
    constructor(private readonly prisma: PrismaService){}

    async createProvider(data: any){
        return await this.prisma.usuario.create({
            data: {
                ...data,
                prestador: {
                    create: {}
                }
            }
        })
    }
    
    
}
