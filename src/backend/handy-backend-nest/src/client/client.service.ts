import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
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
    
    try {
      const client = await this.clientRepository.createClient(clientData);
      console.log(client)
      return { message: 'Cliente criado com sucesso.', data };
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        const targetStr = Array.isArray(target) ? target.join(',') : String(target ?? '');
        if (targetStr.includes('cpf')) {
          throw new ConflictException({ message: 'Este CPF já está cadastrado.', field: 'cpf' });
        }
        if (targetStr.includes('email')) {
          throw new ConflictException({ message: 'Este e-mail já está cadastrado.', field: 'email' });
        }
        throw new ConflictException({ message: 'Já existe um cadastro com esses dados.', field: null });
      }
      throw error;
    }
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

    const tipo = String(user.tipo_usuario ?? '').toLowerCase();
    if (tipo !== 'cliente') {
      throw new UnauthorizedException(
        'Esta conta é de prestador. Entre pela área do prestador.',
      );
    }

    return user;
  }

  async deleteUserAccount(email: string){
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

  async findOrCreateByZitadel(data: { email: string; nome: string; zitadel_id: string }) {
    // 1. Busca pelo zitadel_id
    const byZitadel = await this.clientRepository.findByZitadelId(data.zitadel_id);
    if (byZitadel) return byZitadel;

    // 2. Busca pelo email
    const byEmail = await this.clientRepository.searchClient('email', data.email);
    if (byEmail) {
      // Vincula o zitadel_id ao registro existente
      await this.clientRepository.updateZitadelId(byEmail.user_id, data.zitadel_id);
      return { ...byEmail, zitadel_id: data.zitadel_id };
    }

    // 3. Cria novo usuário (cliente, sem senha, sem CPF)
    const newUser = await this.clientRepository.createClient({
      nome: data.nome,
      email: data.email,
      hash_password: '',
      tipo_usuario: 'cliente',
    });

    // Vincula o zitadel_id ao novo usuário
    await this.clientRepository.updateZitadelId(newUser.user_id, data.zitadel_id);

    return { ...newUser, zitadel_id: data.zitadel_id };
  }
}

