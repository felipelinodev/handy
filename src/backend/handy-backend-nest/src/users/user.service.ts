import { Injectable } from '@nestjs/common';
import { UserRepository } from './repository/users.repository';

@Injectable()
export class UserService {
  
  constructor(private readonly userRepository: UserRepository){}
  async createClient(data: any){
    const client = await this.userRepository.createClient(data)
    
    return { message: 'Cliente criado com sucesso!', client };
  }

}
