import { BadRequestException, Body, Controller, Delete, Get, Headers, InternalServerErrorException, Param, ParseIntPipe, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { conversaSchema, updateConversaSchema } from './schemas/conversations.schema';
import { z } from 'zod';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('view-chat/:conversaId')
  async viewChat(@Param('conversaId', ParseIntPipe) conversaId: number) {
    return this.conversationsService.viewChat(conversaId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-new-chat')
  createNewChat(@Body() body: any) {
    const result = conversaSchema.safeParse(body);

    if (!result.success) {
      const flattened = z.flattenError(result.error).fieldErrors;
      const sliceErro = Object.values(flattened)[0][0];
      throw new BadRequestException(sliceErro);
    }

    try {
      return this.conversationsService.createNewChat(result.data);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('add-status-a-chat/:conversaId')
  async addStatusAChat(
    @Param('conversaId', ParseIntPipe) conversaId: number,
    @Body() body: any,
  ) {
    const result = updateConversaSchema.safeParse(body);

    if (!result.success) {
      const flattened = z.flattenError(result.error).fieldErrors;
      const sliceErro = Object.values(flattened)[0][0];
      throw new BadRequestException(sliceErro);
    }

    return this.conversationsService.updateChat(conversaId, result.data.status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-chat/:conversaId')
  async updateChat(
    @Param('conversaId', ParseIntPipe) conversaId: number,
    @Body() body: any,
  ) {
    const result = updateConversaSchema.safeParse(body);

    if (!result.success) {
      const flattened = z.flattenError(result.error).fieldErrors;
      const sliceErro = Object.values(flattened)[0][0];
      throw new BadRequestException(sliceErro);
    }

    return this.conversationsService.updateChat(conversaId, result.data.status);
  }

  @Delete('delete-chat/:conversaId')
  async deleteChat(
    @Param('conversaId', ParseIntPipe) conversaId: number,
    @Headers('admin-key') chaveAdmin: string,
  ) {
    if (chaveAdmin !== process.env.CHAVE_ADMIN) {
      throw new UnauthorizedException('Apenas administradores podem excluir conversas.');
    }

    return this.conversationsService.deleteChat(conversaId);
  }
}
