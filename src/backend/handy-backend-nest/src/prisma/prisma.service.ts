import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Carrega as variáveis do .env
import 'dotenv/config';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  async onModuleInit() {
    // É necessário criar um Pool usando 'pg' e passá-lo para o PrismaPg
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool as any);
    this.client = new PrismaClient({ adapter });
  }

  async onModuleDestroy() {
    await this.client?.$disconnect();
  }

  get usuario() {
    return this.client.usuario;
  }

  get cliente() {
    return this.client.cliente;
  }

  get prestador() {
    return this.client.prestador;
  }

  get avaliacao() {
    return this.client.avaliacao;
  }

  get contratacoes() {
    return this.client.contratacoes;
  }

  get conversa() {
    return this.client.conversa;
  }

  get mensagem() {
    return this.client.mensagem;
  }

  get servicos() {
    return this.client.servicos;
  }

  get categoria() {
    return this.client.categoria;
  }

  get pagamento() {
    return this.client.pagamento;
  }

  get breakpoints() {
    return this.client.breakpoints;
  }

  get ticket() {
    return this.client.ticket;
  }

  get especialidade() {
    return this.client.especialidade;
  }

  get prestador_especialidade() {
    return this.client.prestador_especialidade;
  }

  get agenda_prestador() {
    return this.client.agenda_prestador;
  }

  get $transaction() {
    return this.client.$transaction.bind(this.client);
  }
}
