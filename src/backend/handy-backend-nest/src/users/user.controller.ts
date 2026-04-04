import { BadRequestException, Body, Controller, Headers, Delete, Get, InternalServerErrorException, Param, ParseIntPipe, Post, Req, UseGuards, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { clientSchema } from './schemas/user.schema';
import {z} from "zod"

import type { CreateClientDto } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';



@Controller('users')
export class UserController {
  
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService         
  ) {}

  @Post('create-client-account')
  createClientAccount(@Body() body: CreateClientDto){

    const result = clientSchema.safeParse(body)

    if(!result.success){
        const flattened  = z.flattenError(result.error).fieldErrors
        const sliceErro = Object.values(flattened)[0][0]
        throw new BadRequestException(sliceErro)
    }

    try {
      return this.userService.createClient(result.data);
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
    
  }

  @UseGuards(JwtAuthGuard)
  @Get('view-client/:id')
   async getClientInfos(@Param('id', ParseIntPipe) id: number){
     return this.userService.viewClientInfos(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-cliente/:id')
  async atualizarCliente(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any
  ){
    
    const result = clientSchema.partial().safeParse(data);

    if(!result.success){
       const flattened  = z.flattenError(result.error).fieldErrors
       const sliceErro = Object.values(flattened)[0][0]
       throw new BadRequestException(sliceErro)
    }

    try {
      return this.userService.atualizarCliente(id, data);
    } catch (error) {
      return{error}
    }
     
  }

  
  @Post('login-client')
  async loginClient(@Body() body: any){
    const {email, senha} = body

   
    try {
        const user = await this.userService.validarAcesso(email, senha)

        const payload = {email: user.email, user_id: user.user_id}

        const{hash_password, cpf, ...userNotPassword } = user

        return {
          accessToken: this.jwtService.sign(payload),
          user: userNotPassword
    }

    } catch (error) {
      
      if(error.status){
        throw error;
      }

      throw new InternalServerErrorException('Erro ao tentar realizar o login.');
    }
    
  }
 
  @Delete('delete-a-client/:email')
  async excluirConta(
    @Param('email') email: string, 
    @Headers('admin-key') chave_admin: string
  ) {
    try {
      return this.userService.excluirContaUsuario(email, chave_admin);
    } catch (error) {
      return {error}
    }
    
  }
}

