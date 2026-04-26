import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateBreakpointInput, UpdateBreakpointInput } from "../types/breakpoints.types";

@Injectable()
export class BreakpointsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createBreakpoint(data: CreateBreakpointInput) {
        return await this.prisma.breakpoints.create({
            data: {
                ...data,
            },
        });
    }

    async searchBreakpoint(campo: 'breakpoint_id', valor: number) {
        return await this.prisma.breakpoints.findUnique({
            where: {
                [campo]: valor,
            },
        });
    }

    async listBreakpointsByPrestador(prestador_id: number) {
        return await this.prisma.breakpoints.findMany({
            where: {
                prestador_id: prestador_id,
            },
        });
    }

    async listBreakpointsByCliente(cliente_id: number) {
        return await this.prisma.breakpoints.findMany({
            where: {
                cliente_id: cliente_id,
            },
        });
    }

    async updateBreakpoint(breakpoint_id: number, data: UpdateBreakpointInput) {
        return await this.prisma.breakpoints.update({
            where: { breakpoint_id: breakpoint_id },
            data: {
                ...data,
            },
        });
    }

    async deleteBreakpoint(breakpoint_id: number) {
        return await this.prisma.breakpoints.delete({
            where: {
                breakpoint_id: breakpoint_id,
            },
        });
    }
}
