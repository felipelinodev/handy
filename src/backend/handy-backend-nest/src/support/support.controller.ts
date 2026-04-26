import { BadRequestException, Body, Controller, Delete, Get, Headers, InternalServerErrorException, Param, ParseIntPipe, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { supportSchema, updateTicketSchema } from './schemas/support.schema';
import { z } from 'zod';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('support')
export class SupportController {

  constructor(private readonly supportService: SupportService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-new-ticket/:usuarioId')
  createNewTicket(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Body() body: any,
  ) {
    const result = supportSchema.safeParse(body);

    if (!result.success) {
      const flattened = z.flattenError(result.error).fieldErrors;
      const sliceErro = Object.values(flattened)[0][0];
      throw new BadRequestException(sliceErro);
    }

    try {
      return this.supportService.createTicket(usuarioId, result.data);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('view-tickets/:usuarioId')
  async viewTickets(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    try {
      return this.supportService.viewTickets(usuarioId);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('view-a-ticket/:ticketId')
  async viewATicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.supportService.viewATicket(ticketId);
  }

  @Patch('update-ticket/:ticketId')
  async updateTicket(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body() body: any,
    @Headers('admin-key') chaveAdmin: string,
  ) {
    if (chaveAdmin !== process.env.CHAVE_ADMIN) {
      throw new UnauthorizedException('Apenas administradores podem atualizar tickets.');
    }

    const result = updateTicketSchema.safeParse(body);

    if (!result.success) {
      const flattened = z.flattenError(result.error).fieldErrors;
      const sliceErro = Object.values(flattened)[0][0];
      throw new BadRequestException(sliceErro);
    }

    return this.supportService.updateTicket(ticketId, result.data);
  }

  @Delete('delete-a-ticket/:ticketId')
  async deleteATicket(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Headers('admin-key') chaveAdmin: string,
  ) {
    if (chaveAdmin !== process.env.CHAVE_ADMIN) {
      throw new UnauthorizedException('Apenas administradores podem excluir tickets.');
    }

    return this.supportService.deleteTicket(ticketId);
  }
}
