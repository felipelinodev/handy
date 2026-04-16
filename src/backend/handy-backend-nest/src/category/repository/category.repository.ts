import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import type { CreateCategoriaInput } from '../types/category.types';

export type BuscarCategoriaPor = 'categoria_id' | 'nome_categoria';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(data: CreateCategoriaInput) {
    return await this.prisma.categoria.create({
      data,
    });
  }

  async searchCategory(campo: BuscarCategoriaPor, valor: string | number) {
    return await this.prisma.categoria.findUnique({
      where: {
        [campo]: valor,
      },
    });
  }

  async searchAllCategories() {
    return await this.prisma.categoria.findMany();
  }

  async deleteCategory(id: number) {
    return await this.prisma.categoria.delete({
      where: {
        categoria_id: id,
      },
    });
  }
}
