import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { checkExists } from 'src/utils';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFilterDto } from './dto/category-filter.dto';

@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async findPageableCategories(filters: CategoryFilterDto) {
    const [categories, totalCount] = await Promise.all([
      this.categoryRepository.findPageableCategories(filters),
      this.categoryRepository.countCategories(filters),
    ]);
    return filters.toPageResponse(categories, totalCount);
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    return this.categoryRepository.createCategory(createCategoryDto);
  }

  async findCategoryByIdOrThrow(categoryId: string) {
    return checkExists(
      this.categoryRepository.findCategoryById(categoryId),
      'Category not Found',
    );
  }

  async updateCategory(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    await this.findCategoryByIdOrThrow(categoryId);
    return this.categoryRepository.updateCategory(
      categoryId,
      updateCategoryDto,
    );
  }

  async deleteCategory(categoryId: string) {
    await this.findCategoryByIdOrThrow(categoryId);
    return this.categoryRepository.deleteCategory(categoryId);
  }
}
