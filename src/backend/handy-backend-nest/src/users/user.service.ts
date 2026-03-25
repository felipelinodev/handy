import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { BuscarPor, UserRepository } from './repository/users.repository';
import { HashProvider } from 'common/security/security.module';

// TODO: Import the proper DTO for better type safety
// import type { CreateClientDto } from './schemas/user.schema';


@Injectable()
export class UserService {
  
  constructor(
    private readonly userRepository: UserRepository, 
    private readonly hashProvier: HashProvider){}

  async createClient(data: any){

    const { senha, ...rest } = data;
 
    const hashSenha = await this.hashProvier.hashGenerator(senha);

    const clientData = {
      hash_password: hashSenha, 
      ...rest}
    
    const client = await this.userRepository.createClient(clientData);
    
    console.log(client)
    return { message: 'Cliente criado com sucesso.', data };
  }

  async viewClientInfos(id: number){
    return this.userRepository.buscarUsuario('user_id', id)
  }

  async buscarUserEmail(email: string){
    return this.userRepository.buscarUsuario('email', email)
  }

  async validarAcesso(email: string, senhaPassada: string) {
    const user = await this.buscarUserEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await this.hashProvier.comparePassword(senhaPassada, user.hash_password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    return user;
  }


  async excluirContaUsuario(email: string, chaveAdmin: string){

    if(chaveAdmin !== process.env.CHAVE_ADMIN){
      throw new UnauthorizedException('Você não tem permissão para excluir essa conta.');
    }

    const user = await this.buscarUserEmail(email);
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado para este email.');
    }

    await this.userRepository.deletarUsuario(email)

    return{
        message: 'Conta de usuário excluída com sucesso!',
        user,
    }
  }

  async atualizarCliente(id: number, data: any) {
    const user = await this.viewClientInfos(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado para atualizar.');
    }

    if (data.senha) {
      data.hash_password = await this.hashProvier.hashGenerator(data.senha);
      delete data.senha;
    }

    const updatedUser = await this.userRepository.atualizarUsuario(id, data);

    return {
      message: 'Dados do cliente atualizados com sucesso!',
      user: updatedUser
    };
  }
}

