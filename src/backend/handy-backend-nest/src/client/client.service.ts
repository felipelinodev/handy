import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ClientRepository } from './repository/client.repository';
import { HashProvider } from 'common/security/security.module';


@Injectable()
export class ClientService {
  
  constructor(
    private readonly clientRepository: ClientRepository, 
    private readonly hashProvier: HashProvider){}

  async createClient(data: any){

    const { senha, ...rest } = data;
 
    const hashSenha = await this.hashProvier.hashGenerator(senha);

    const clientData = {
      hash_password: hashSenha, 
      ...rest}
    
    const client = await this.clientRepository.createClient(clientData);
    
    console.log(client)
    return { message: 'Cliente criado com sucesso.', data };
  }

  async viewClientInfos(id: number){
    return this.clientRepository.searchClient('user_id', id)
  }

  async searchClientById(id: number){
    return this.clientRepository.searchClient('user_id', id)
  }

  async searchClientByEmail(email: string){
    return this.clientRepository.searchClient('email', email)
  }

  async validateAccess(email: string, senhaPassada: string) {
    const user = await this.searchClientByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await this.hashProvier.comparePassword(senhaPassada, user.hash_password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    return user;
  }

  async deleteUserAccount(email: string, chaveAdmin: string){

    if(chaveAdmin !== process.env.CHAVE_ADMIN){
      throw new UnauthorizedException('Você não tem permissão para excluir essa conta.');
    }

    const user = await this.searchClientByEmail(email);
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado para este email.');
    }

    await this.clientRepository.deleteClient(email)

    return{
        message: 'Conta de usuário excluída com sucesso!',
        user,
    }
  }

  async updateThisClient(id: number, data: any) {
    const user = await this.viewClientInfos(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado para atualizar.');
    }

    if (data.senha) {
      data.hash_password = await this.hashProvier.hashGenerator(data.senha);
      delete data.senha;
    }

    const updatedUser = await this.clientRepository.updateClient(id, data);

    return {
      message: 'Dados do cliente atualizados com sucesso!',
      user: updatedUser
    };
  }
}

