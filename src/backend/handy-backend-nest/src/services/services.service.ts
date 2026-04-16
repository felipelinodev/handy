import { Injectable, NotFoundException } from "@nestjs/common";
import { ServicesRepository } from "./repository/services.repository";
import { CreateServicoInput, UpdateServicoInput } from "./types/services.types";

@Injectable()
export class ServicesService {
    constructor(
        private readonly servicesRepository: ServicesRepository
    ) {}

    async createService(data: CreateServicoInput) {
        const service = await this.servicesRepository.createService(data);
        return { message: "Serviço criado com sucesso.", service };
    }

    async findServiceById(id: number) {
        return this.servicesRepository.findServiceById(id);
    }

    async listAllServices(page: number) {
        return this.servicesRepository.listAllServices(page);
    }

    async findServicesByName(name: string, page: number) {
        return this.servicesRepository.findServicesByName(name, page);
    }

    async updateService(id: number, data: UpdateServicoInput) {
        const service = await this.findServiceById(id);
        if (!service) {
            throw new NotFoundException('Serviço não encontrado para atualização.');
        }
        return this.servicesRepository.updateService(id, data);
    }

    async deleteService(id: number) {
        const service = await this.findServiceById(id);
        if (!service) {
            throw new NotFoundException('Serviço não encontrado para exclusão.');
        }

        await this.servicesRepository.deleteService(id);
        return {
            message: 'Serviço excluído com sucesso!',
            service,
        };
    }
}
