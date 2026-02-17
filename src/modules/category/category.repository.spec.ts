import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from './category.repository';
import { DatabaseService } from '../database/database.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFilterDto } from './dto/category-filter.dto';

const mockCategory = {
  id: 'category-id',
  name: 'Test Category',
  description: 'Test Description',
  slug: 'test-category',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: 'user-id',
};

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let databaseService: DeepMocked<DatabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRepository,
        {
          provide: DatabaseService,
          useValue: createMock<DatabaseService>(),
        },
      ],
    }).compile();

    repository = module.get(CategoryRepository);
    databaseService = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Test Category',
        description: 'Test Description',
        createdById: 'user-id',
      };

      databaseService.category.create.mockResolvedValue(mockCategory);

      const result = await repository.createCategory(createDto);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('findCategoryById', () => {
    it('should find category by id', async () => {
      databaseService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await repository.findCategoryById(mockCategory.id);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('updateCategory', () => {
    it('should update category', async () => {
      const updateDto: UpdateCategoryDto = { name: 'Updated' };
      const updatedCategory = { ...mockCategory, ...updateDto };

      databaseService.category.update.mockResolvedValue(updatedCategory);

      const result = await repository.updateCategory(
        mockCategory.id,
        updateDto,
      );

      expect(result).toEqual(updatedCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should delete category', async () => {
      databaseService.category.delete.mockResolvedValue(mockCategory);

      const result = await repository.deleteCategory(mockCategory.id);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('countCategories', () => {
    it('should return count of categories', async () => {
      const filters = new CategoryFilterDto();
      databaseService.category.count.mockResolvedValue(10);

      const result = await repository.countCategories(filters);

      expect(result).toBe(10);
    });

    it('should filter by search term', async () => {
      const filters = new CategoryFilterDto();
      filters.search = 'test';
      databaseService.category.count.mockResolvedValue(5);

      const result = await repository.countCategories(filters);

      expect(result).toBe(5);
    });
  });

  describe('findPageableCategories', () => {
    it('should return pageable categories', async () => {
      const filters = new CategoryFilterDto();
      filters.pageNumber = 1;
      filters.pageSize = 10;

      const categories = [mockCategory];
      databaseService.category.findMany.mockResolvedValue(categories);

      const result = await repository.findPageableCategories(filters);

      expect(result).toEqual(categories);
    });
  });
});
