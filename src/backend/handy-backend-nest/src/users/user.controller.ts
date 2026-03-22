import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { clientSchema } from './schemas/user.schema';
import type { CreateClientDto } from './schemas/user.schema';
import {z} from "zod"


@Controller('users')
export class UserController {
  
  constructor(private readonly userService: UserService) {}

  @Post('create-client-account')
  createClientAccount(@Body() body: CreateClientDto){

    const result = clientSchema.safeParse(body)

    if(!result.success){
        const flattened  = z.flattenError(result.error).fieldErrors
        const sliceErro = Object.values(flattened)[0][0]
        throw new BadRequestException(sliceErro) // BadRequestException -> Status 400 Erros de validação.
    }
    return this.userService.createClient(result.data);
  }

}
