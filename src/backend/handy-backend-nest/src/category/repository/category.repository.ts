import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import type { CreateCategoryInput } from '../types/category.types';

export type BuscarPor = 'categoria_id' | 'nome_categoria';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(data: CreateCategoryInput) {
    return await this.prisma.categoria.create({
      data,
    });
  }

  async searchCategory(campo: BuscarPor, valor: string | number) {
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
