import { DatabaseService } from '../database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFilterDto } from './dto/category-filter.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class CategoryRepository {
  private readonly categoryRepository: Prisma.CategoryDelegate;
  private readonly eventRepository: Prisma.EventDelegate;

  constructor(db: DatabaseService) {
    this.categoryRepository = db.category;
    this.eventRepository = db.event;
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

  async countCategoryEvents(categoryId: string) {
    return this.eventRepository.count({ where: { categoryId } });
  }

  async deleteCategory(categoryId: string) {
    return this.categoryRepository.delete({ where: { id: categoryId } });
  }

  private getWhereClause(filters: CategoryFilterDto) {
    const whereClause: Prisma.CategoryWhereInput = {};
    if (filters.search) {
      whereClause.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }
    return whereClause;
  }

  async countCategories(filters: CategoryFilterDto) {
    const whereClause = this.getWhereClause(filters);
    return this.categoryRepository.count({ where: whereClause });
  }

  async findPageableCategories(filters: CategoryFilterDto) {
    const whereClause = this.getWhereClause(filters);

    return this.categoryRepository.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      skip: filters.skip,
      take: filters.take,
    });
  }
}
