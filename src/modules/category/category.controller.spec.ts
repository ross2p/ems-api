import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CategoryFilterDto } from './dto/category-filter.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UserEntity } from '../user/user.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '../../guards/user.guard';
import { PageResponse } from '../../utils/pageables/page-response.utils';
import { CategoryEntity } from './category.entity';
import { PageRequest } from '../../utils/pageables/page-request.utils';

const mockCategory: CategoryEntity = {
  id: 'category-id',
  name: 'Test Category',
  description: 'Test Description',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: 'user-id',
};

const mockUser: UserEntity = {
  id: 'user-id',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'password',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: DeepMocked<CategoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: createMock<CategoryService>(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCategories', () => {
    it('should return categories', async () => {
      const filters = new CategoryFilterDto();
      const pageRequest = { pageNumber: 1, pageSize: 10 };

      const expectedResult = new PageResponse<CategoryEntity>(
        pageRequest as PageRequest,
        [mockCategory],
        1,
      );

      service.findPageableCategories.mockResolvedValue(expectedResult);

      const result = await controller.getCategories(filters);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Test Category',
        description: 'Test Description',
        createdById: 'user-id',
      };

      service.createCategory.mockResolvedValue(mockCategory);

      const result = await controller.createCategory(createDto, mockUser);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('getCategoryById', () => {
    it('should return a category', async () => {
      service.findCategoryByIdOrThrow.mockResolvedValue(mockCategory);

      const result = await controller.getCategoryById(mockCategory.id);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const updateDto: UpdateCategoryDto = { name: 'Updated' };
      service.updateCategory.mockResolvedValue({
        ...mockCategory,
        ...updateDto,
      });

      const result = await controller.updateCategory(
        mockCategory.id,
        updateDto,
      );

      expect(result).toEqual({ ...mockCategory, ...updateDto });
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      service.deleteCategory.mockResolvedValue(mockCategory);

      const result = await controller.deleteCategory(mockCategory.id);

      expect(result).toEqual(mockCategory);
    });
  });
});
