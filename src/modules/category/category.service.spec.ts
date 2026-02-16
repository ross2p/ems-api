import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NotFoundException } from '@nestjs/common';
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

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: DeepMocked<CategoryRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: createMock<CategoryRepository>(),
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get(CategoryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findPageableCategories', () => {
    it('should return pageable categories', async () => {
      const filters = new CategoryFilterDto();
      const categories = [mockCategory];
      const totalCount = 1;

      repository.findPageableCategories.mockResolvedValue(categories);
      repository.countCategories.mockResolvedValue(totalCount);

      const result = await service.findPageableCategories(filters);

      expect(result).toEqual(filters.toPageResponse(categories, totalCount));
    });
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Test Category',
        description: 'Test Description',
        createdById: 'user-id',
      };

      repository.createCategory.mockResolvedValue(mockCategory);

      const result = await service.createCategory(createDto);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('findCategoryByIdOrThrow', () => {
    it('should return a category if found', async () => {
      repository.findCategoryById.mockResolvedValue(mockCategory);

      const result = await service.findCategoryByIdOrThrow(mockCategory.id);

      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findCategoryById.mockResolvedValue(null);

      await expect(
        service.findCategoryByIdOrThrow('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCategory', () => {
    it('should update a category if found', async () => {
      const updateDto: UpdateCategoryDto = { name: 'Updated Name' };
      const updatedCategory = { ...mockCategory, ...updateDto };

      repository.findCategoryById.mockResolvedValue(mockCategory);
      repository.updateCategory.mockResolvedValue(updatedCategory);

      const result = await service.updateCategory(mockCategory.id, updateDto);

      expect(result).toEqual(updatedCategory);
    });

    it('should throw if category not found', async () => {
      repository.findCategoryById.mockResolvedValue(null);

      await expect(
        service.updateCategory('non-existent-id', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category if found', async () => {
      repository.findCategoryById.mockResolvedValue(mockCategory);
      repository.deleteCategory.mockResolvedValue(mockCategory);

      const result = await service.deleteCategory(mockCategory.id);

      expect(result).toEqual(mockCategory);
    });

    it('should throw if category not found', async () => {
      repository.findCategoryById.mockResolvedValue(null);

      await expect(service.deleteCategory('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
