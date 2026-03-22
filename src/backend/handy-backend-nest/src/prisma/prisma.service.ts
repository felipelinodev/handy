import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import * as path from 'path';
import { pathToFileURL } from 'url';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  async onModuleInit() {
    // Resolve the path to the original generated ESM files (not the compiled dist version)
    const generatedPath = path.resolve(__dirname, '..', '..', '..', 'generated', 'prisma', 'client.js');
    const { PrismaClient } = await import(pathToFileURL(generatedPath).href);
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
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
}
