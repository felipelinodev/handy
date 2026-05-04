import { BadRequestException, Body, Controller, Delete, Get, Headers, InternalServerErrorException, Param, ParseIntPipe, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { mensagemSchema, createNewMensagemSchema } from './schemas/messages.schema';
import { z } from 'zod';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SuperAdminGuard } from 'src/auth/super-admin.guard';

@Controller('messages')
export class MessagesController {

  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('view-menssages/:conversaId')
  async viewMenssages(@Param('conversaId', ParseIntPipe) conversaId: number) {
    return this.messagesService.viewMenssages(conversaId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('view-all-menssages')
  async viewAllMenssages() {
    return this.messagesService.viewAllMenssages();
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-menssage')
  createMenssage(@Body() body: any) {
    const result = mensagemSchema.safeParse(body);

    if (!result.success) {
      const flattened = z.flattenError(result.error).fieldErrors;
      const sliceErro = Object.values(flattened)[0][0];
      throw new BadRequestException(sliceErro);
    }

    try {
      return this.messagesService.createMenssage(result.data);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-new-menssage')
  createNewMenssage(@Body() body: any) {
    const result = createNewMensagemSchema.safeParse(body);

    if (!result.success) {
      const flattened = z.flattenError(result.error).fieldErrors;
      const sliceErro = Object.values(flattened)[0][0];
      throw new BadRequestException(sliceErro);
    }

    try {
      return this.messagesService.createNewMenssage(result.data);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(SuperAdminGuard)
  @Delete('delete-a-menssage/:mensagemId')
  async deleteAMenssage(
    @Param('mensagemId', ParseIntPipe) mensagemId: number
  ) {
    return this.messagesService.deleteMenssage(mensagemId);
  }
}
