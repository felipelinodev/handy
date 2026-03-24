import { Injectable } from '@nestjs/common';
import { UserRepository } from './repository/users.repository';
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
    return this.userRepository.buscarUsuarioPorId(id)
  }

}
