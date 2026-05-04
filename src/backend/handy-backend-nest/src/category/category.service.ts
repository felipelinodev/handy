import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { CategoryRepository } from './repository/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(data: any) {
    const existingCategory = await this.categoryRepository.searchCategory('nome_categoria', data.nome_categoria);

    if (existingCategory) {
      throw new ConflictException('Uma categoria com esse nome já existe.');
    }

    const category = await this.categoryRepository.createCategory(data);
    return { message: 'Categoria criada com sucesso.', data: category };
  }

  async viewCategoryInfos(id: number) {
    const category = await this.categoryRepository.searchCategory('categoria_id', id);

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    return category;
  }

  async viewAllCategories() {
    return await this.categoryRepository.searchAllCategories();
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepository.searchCategory('categoria_id', id);

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    await this.categoryRepository.deleteCategory(id);

    return {
      message: 'Categoria excluída com sucesso!',
      category,
    };
  }
}
