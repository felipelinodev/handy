import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { clientSchema } from './schemas/user.schema';
import {z} from "zod"

import type { CreateClientDto } from './schemas/user.schema';
import { request } from 'http';


@Controller('users')
export class UserController {
  
  constructor(private readonly userService: UserService) {}

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


  // @Get('view-client/:id')
  // async getClientInfos(@Param('id', ParseIntPipe) id: number){
  //   return this.userService.viewClientInfos(id);
  // }

  
  @Post('login-client')
  loginClient(@Body() body: any){

    return none
    
  }


}
