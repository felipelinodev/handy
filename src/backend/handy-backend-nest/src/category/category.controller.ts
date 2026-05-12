import { BadRequestException, Body, Controller, Headers, Delete, Get, InternalServerErrorException, Param, ParseIntPipe, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CategoryService } from './category.service';
import { categorySchema } from './schemas/category.schema';
import { z } from "zod";

import type { CreateCategoryDto } from './schemas/category.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SuperAdminGuard } from 'src/auth/super-admin.guard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('register-category')
  async registerCategory(@Body() body: CreateCategoryDto) {
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      const flattened = z.flattenError(result.error).fieldErrors;
      const sliceErro = Object.values(flattened)[0][0];
      throw new BadRequestException(sliceErro);
    }

    try {
      return await this.categoryService.createCategory(result.data);
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('view-category/:id')
  async viewCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.viewCategoryInfos(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('view-all-category')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('view_all_categories')
  async viewAllCategory() {
    return await this.categoryService.viewAllCategories();
  }

  @Get('public/list')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('public_list_categories')
  async listPublicCategories() {
    return await this.categoryService.viewAllCategories();
  }

  @UseGuards(SuperAdminGuard)
  @Delete('remove-category/:id')
  async removeCategory(
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      return await this.categoryService.deleteCategory(id);
    } catch (error) {
      return { error };
    }
  }
}
