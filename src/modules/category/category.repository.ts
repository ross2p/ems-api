import { DatabaseService } from 'src/database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryRepository {
  private readonly categoryRepository;

  constructor(db: DatabaseService) {
    this.categoryRepository = db.category;
  }

  async createCategory(data: CreateCategoryDto) {
    return this.categoryRepository.create({ data });
  }

  async findCategoryById(categoryId: string) {
    return this.categoryRepository.findUnique({ where: { id: categoryId } });
  }

  async updateCategory(categoryId: string, data: UpdateCategoryDto) {
    return this.categoryRepository.update({ where: { id: categoryId }, data });
  }

  async deleteCategory(categoryId: string) {
    return this.categoryRepository.delete({ where: { id: categoryId } });
  }
}
