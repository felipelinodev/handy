import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ProviderRepository } from "./repository/provider.repository";
import { HashProvider } from "common/security/security.module";
import { CreateUsuarioInput } from "./types/provider.types";

@Injectable()
export class ProviderService{
    constructor(
        private readonly providerRepository: ProviderRepository,
        private readonly hashProvider: HashProvider
    ){}

    async createServiceProvider(data: CreateUsuarioInput){
        const {senha, ...rest} = data as any;

        const hashSenha = this.hashProvider.hashGenerator(senha);

        const providerData = {
            hash_password: hashSenha,
             ...rest}
        
        const serviceProvider = await this.providerRepository.createProvider(providerData);

        return {message: "Prestador de serviços criado com sucesso.", serviceProvider}

    }


 async viewServiceProviderByEmail(email: string){
    return this.providerRepository.searchProvider('email', email)
  }

  async searchServiceProviderById(id: number){
    return this.providerRepository.searchProvider('user_id', id)
  }

  
  async deleteUserAccount(email: string, chaveAdmin: string){

    if(chaveAdmin !== process.env.CHAVE_ADMIN){
      throw new UnauthorizedException('Você não tem permissão para excluir essa conta.');
    }

    const user = await this.viewServiceProviderByEmail(email);
    
    if (!user) {
      throw new NotFoundException('Prestador de serviços não encontrado para este email.');
    }

    await this.providerRepository.deleteProvider(email)

    return{
        message: 'Conta de usuário excluída com sucesso!',
        user,
    }
  }

}