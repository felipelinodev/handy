import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ProviderRepository } from "./repository/provider.repository";
import { HashProvider } from "common/security/security.module";
import { CreatePrestadorInput, CreateServicoInput, CreateUsuarioInput } from "./types/provider.types";

@Injectable()
export class ProviderService {
    constructor(
        private readonly providerRepository: ProviderRepository,
        private readonly hashProvider: HashProvider
    ) {}

    async createServiceProvider(data: CreateUsuarioInput) {
        const { senha, ...rest } = data as any;
        
        // ADICIONADO AWAIT
        const hashSenha = await this.hashProvider.hashGenerator(senha);

        const providerData = {
            hash_password: hashSenha,
            ...rest
        }

        const serviceProvider = await this.providerRepository.createProvider(providerData);
        return { message: "Prestador de serviços criado com sucesso.", serviceProvider }
    }

    async viewServiceProviderByEmail(email: string) {
        return this.providerRepository.searchProvider('email', email)
    }

    async searchServiceProviderById(id: number) {
        return this.providerRepository.searchProvider('user_id', id)
    }

    async listServiceProviders(page: number = 1) {
        return this.providerRepository.listAllProviders(page);
    }

    async listEspecialidades() {
        return this.providerRepository.listEspecialidades();
    }

    async updateServiceProvider(id: number, data: any) {
        const provider = await this.searchServiceProviderById(id);
        if (!provider) {
            throw new NotFoundException('Prestador não encontrado para atualização.');
        }
        return this.providerRepository.updateProvider(id, data);
    }

    async validateAccess(email: string, senha: string) {
        const user = await this.viewServiceProviderByEmail(email);
        if (!user) {
            throw new UnauthorizedException('E-mail ou senha incorretos.');
        }

        const isPasswordValid = await this.hashProvider.comparePassword(senha, user.hash_password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('E-mail ou senha incorretos.');
        }

        const tipo = String((user as any).tipo_usuario ?? '').toLowerCase();
        if (tipo !== 'prestador') {
            throw new UnauthorizedException(
                'Esta conta é de cliente. Entre pela área do cliente.',
            );
        }

        return user;
    }

    async deleteUserAccount(email: string) {
        const user = await this.viewServiceProviderByEmail(email);
        if (!user) {
            throw new NotFoundException('Prestador de serviços não encontrado para este email.');
        }

        await this.providerRepository.deleteProvider(email);
        return {
            message: 'Conta de usuário excluída com sucesso!',
            user,
        }
    }
}