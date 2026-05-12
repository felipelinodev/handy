import { Injectable, NotFoundException, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CategoryRepository } from './repository/category.repository';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async createCategory(data: any) {
    const existingCategory = await this.categoryRepository.searchCategory('nome_categoria', data.nome_categoria);

    if (existingCategory) {
      throw new ConflictException('Uma categoria com esse nome já existe.');
    }

    const category = await this.categoryRepository.createCategory(data);
    
    // Invalidate the cache for categories
    await this.cacheManager.del('view_all_categories');
    await this.cacheManager.del('public_list_categories');

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

    // Invalidate the cache for categories
    await this.cacheManager.del('view_all_categories');
    await this.cacheManager.del('public_list_categories');

    return {
      message: 'Categoria excluída com sucesso!',
      category,
    };
  }
}
