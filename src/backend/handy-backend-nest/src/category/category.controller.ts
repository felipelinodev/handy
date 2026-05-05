import { BadRequestException, Body, Controller, Headers, Delete, Get, InternalServerErrorException, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { categorySchema } from './schemas/category.schema';
import { z } from "zod";

import type { CreateCategoryDto } from './schemas/category.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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
  async viewAllCategory() {
    return await this.categoryService.viewAllCategories();
  }

  @Get('public/list')
  async listPublicCategories() {
    return await this.categoryService.viewAllCategories();
  }

  @Delete('remove-category/:id')
  async removeCategory(
    @Param('id', ParseIntPipe) id: number,
    @Headers('admin-key') chave_admin: string
  ) {
    try {
      return await this.categoryService.deleteCategory(id, chave_admin);
    } catch (error) {
      return { error };
    }
  }
}
