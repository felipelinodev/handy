import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';

import type { CreateProviderAvailabilityInput, UpdateProviderAvailabilityInput } from "../types/provider-availability.types";

export type BuscarPor = 'agenda_id';

@Injectable()
export class ProviderAvailabilityRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createAvailability(data: CreateProviderAvailabilityInput) {
        return await this.prisma.agenda_prestador.create({
            data
        });
    }

    async createManyAvailability(data: CreateProviderAvailabilityInput[]) {
        return await this.prisma.agenda_prestador.createMany({
            data
        });
    }

    async buscarAgenda(campo: BuscarPor, valor: number) {
        return await this.prisma.agenda_prestador.findUnique({
            where: {
                [campo]: valor
            }
        });
    }

    async buscarAgendasPorPrestador(prestadorId: number) {
        return await this.prisma.agenda_prestador.findMany({
            where: { prestador_id: prestadorId },
            orderBy: [
                { data_disponivel: 'asc' },
                { hora_inicio: 'asc' }
            ]
        });
    }

    async buscarAgendasLivresPorPrestador(prestadorId: number) {
        return await this.prisma.agenda_prestador.findMany({
            where: {
                prestador_id: prestadorId,
                status: 'Livre'
            },
            orderBy: [
                { data_disponivel: 'asc' },
                { hora_inicio: 'asc' }
            ]
        });
    }

    async atualizarAgenda(id: number, data: UpdateProviderAvailabilityInput) {
        return await this.prisma.agenda_prestador.update({
            where: { agenda_id: id },
            data
        });
    }

    async deletarAgenda(id: number) {
        return await this.prisma.agenda_prestador.delete({
            where: { agenda_id: id }
        });
    }

    async buscarTodasAgendas() {
        return await this.prisma.agenda_prestador.findMany({
            orderBy: [
                { data_disponivel: 'asc' },
                { hora_inicio: 'asc' }
            ]
        });
    }
}
