import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { BreakpointsRepository } from "./repository/breakpoints.repository";
import { CreateBreakpointInput, UpdateBreakpointInput } from "./types/breakpoints.types";

@Injectable()
export class BreakpointsService {
    constructor(
        private readonly breakpointsRepository: BreakpointsRepository
    ) {}

    async createBreakpoint(data: CreateBreakpointInput) {
        const breakpoint = await this.breakpointsRepository.createBreakpoint(data);
        return { message: "Breakpoint criado com sucesso.", breakpoint };
    }

    async searchBreakpointById(id: number) {
        return this.breakpointsRepository.searchBreakpoint('breakpoint_id', id);
    }

    async listBreakpointsByPrestador(prestador_id: number) {
        return this.breakpointsRepository.listBreakpointsByPrestador(prestador_id);
    }

    async listBreakpointsByCliente(cliente_id: number) {
        return this.breakpointsRepository.listBreakpointsByCliente(cliente_id);
    }

    async updateBreakpoint(id: number, data: UpdateBreakpointInput) {
        const breakpoint = await this.searchBreakpointById(id);
        if (!breakpoint) {
            throw new NotFoundException("Breakpoint não encontrado para atualização.");
        }
        return this.breakpointsRepository.updateBreakpoint(id, data);
    }

    async deleteBreakpoint(id: number) {
        const breakpoint = await this.searchBreakpointById(id);
        if (!breakpoint) {
            throw new NotFoundException("Breakpoint não encontrado.");
        }

        await this.breakpointsRepository.deleteBreakpoint(id);
        return {
            message: "Breakpoint excluído com sucesso!",
            breakpoint,
        };
    }
}
