import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProviderAvailabilityRepository } from './repository/provider-availability.repository';

@Injectable()
export class ProviderAvailabilityService {

  constructor(private readonly providerAvailabilityRepository: ProviderAvailabilityRepository) {}

  async createAvailability(data: any) {
    const formattedData = {
      ...data,
      data_disponivel: new Date(`${data.data_disponivel}T00:00:00Z`),
      hora_inicio: data.hora_inicio ? new Date(`${data.data_disponivel}T${data.hora_inicio}Z`) : null,
      hora_fim: data.hora_fim ? new Date(`${data.data_disponivel}T${data.hora_fim}Z`) : null,
    };
    const availability = await this.providerAvailabilityRepository.createAvailability(formattedData);
    return { message: 'Disponibilidade criada com sucesso.', data: availability };
  }

  async createManyAvailability(data: any[]) {
    const formattedData = data.map(item => ({
      ...item,
      data_disponivel: new Date(`${item.data_disponivel}T00:00:00Z`),
      hora_inicio: item.hora_inicio ? new Date(`${item.data_disponivel}T${item.hora_inicio}Z`) : null,
      hora_fim: item.hora_fim ? new Date(`${item.data_disponivel}T${item.hora_fim}Z`) : null,
    }));
    const result = await this.providerAvailabilityRepository.createManyAvailability(formattedData);
    return { message: `${result.count} disponibilidades criadas com sucesso.`, data: result };
  }

  async viewAvailability(id: number) {
    const availability = await this.providerAvailabilityRepository.buscarAgenda('agenda_id', id);
    if (!availability) {
      throw new NotFoundException('Disponibilidade não encontrada.');
    }
    return availability;
  }

  async viewProviderSchedule(prestadorId: number) {
    return this.providerAvailabilityRepository.buscarAgendasPorPrestador(prestadorId);
  }

  async viewProviderFreeSlots(prestadorId: number) {
    return this.providerAvailabilityRepository.buscarAgendasLivresPorPrestador(prestadorId);
  }

  async updateAvailability(id: number, data: any) {
    const availability = await this.providerAvailabilityRepository.buscarAgenda('agenda_id', id);
    if (!availability) {
      throw new NotFoundException('Disponibilidade não encontrada para atualizar.');
    }

    const updatedAvailability = await this.providerAvailabilityRepository.atualizarAgenda(id, data);

    return {
      message: 'Disponibilidade atualizada com sucesso!',
      data: updatedAvailability
    };
  }

  async reserveSlot(id: number, contratacaoId: number) {
    const availability = await this.providerAvailabilityRepository.buscarAgenda('agenda_id', id);
    if (!availability) {
      throw new NotFoundException('Disponibilidade não encontrada.');
    }

    if (availability.status !== 'Livre') {
      throw new BadRequestException('Este horário não está disponível para reserva.');
    }

    const reserved = await this.providerAvailabilityRepository.atualizarAgenda(id, {
      status: 'Reservado',
      contratacao_id: contratacaoId
    });

    return {
      message: 'Horário reservado com sucesso!',
      data: reserved
    };
  }

  async deleteAvailability(id: number) {
    const availability = await this.providerAvailabilityRepository.buscarAgenda('agenda_id', id);
    if (!availability) {
      throw new NotFoundException('Disponibilidade não encontrada.');
    }

    await this.providerAvailabilityRepository.deletarAgenda(id);

    return {
      message: 'Disponibilidade removida com sucesso!',
      data: availability
    };
  }

  async viewAllAvailabilities() {
    return this.providerAvailabilityRepository.buscarTodasAgendas();
  }
}
