import { setupTestEnvironment } from '../../../utils/test-setup.util';
import { CategoryService } from '../../@modules/category/category.service';
import { CreateCategoryDto } from '../../@modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../@modules/category/dto/update-category.dto';
import { CategoryFilterDto } from '../../@modules/category/dto/category-filter.dto';
import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

describe('CategoryService (Integration)', () => {
  const env = setupTestEnvironment();
  let categoryService: CategoryService;

  let testUserId: string;

  beforeAll(async () => {
    categoryService = env.app.get(CategoryService);
  });

  beforeEach(async () => {
    const user = await env.dbEnv.prisma.user.create({
      data: {
        email: `categorytest_${Date.now()}@example.com`,
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword',
      },
    });
    testUserId = user.id;
  });

  describe('createCategory', () => {
    it('should successfully create a category', async () => {
      const dto: CreateCategoryDto = {
        name: 'New Category',
        description: 'A brand new category',
        createdById: testUserId,
      };

      const result = await categoryService.createCategory(dto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(dto.name);
      expect(result.description).toBe(dto.description);
      expect(result.createdById).toBe(testUserId);

      // Verify in DB
      const dbCategory = await env.dbEnv.prisma.category.findUnique({
        where: { id: result.id },
      });
      expect(dbCategory).toBeDefined();
      expect(dbCategory?.name).toBe('New Category');
    });
  });

  describe('findCategoryByIdOrThrow', () => {
    it('should return a category by ID', async () => {
      const created = await categoryService.createCategory({
        name: 'Lookup Category',
        description: 'Test details',
        createdById: testUserId,
      });

      const found = await categoryService.findCategoryByIdOrThrow(created.id);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Lookup Category');
    });

    it('should throw NotFoundException for invalid ID', async () => {
      await expect(
        categoryService.findCategoryByIdOrThrow(randomUUID()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      const created = await categoryService.createCategory({
        name: 'Old Name',
        description: 'Old description',
        createdById: testUserId,
      });

      const updateDto: UpdateCategoryDto = {
        name: 'New Name',
        description: 'New description',
      };

      const updated = await categoryService.updateCategory(
        created.id,
        updateDto,
      );

      expect(updated).toBeDefined();
      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('New Name');
      expect(updated.description).toBe('New description');

      const dbCategory = await env.dbEnv.prisma.category.findUnique({
        where: { id: created.id },
      });
      expect(dbCategory?.name).toBe('New Name');
    });

    it('should throw NotFoundException when updating non-existent category', async () => {
      await expect(
        categoryService.updateCategory(randomUUID(), { name: 'Any Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category successfully', async () => {
      const created = await categoryService.createCategory({
        name: 'To be deleted',
        description: 'Temp category',
        createdById: testUserId,
      });

      const deleted = await categoryService.deleteCategory(created.id);
      expect(deleted).toBeDefined();
      expect(deleted.id).toBe(created.id);

      // Verify removal
      const dbCategory = await env.dbEnv.prisma.category.findUnique({
        where: { id: created.id },
      });
      expect(dbCategory).toBeNull();
    });

    it('should throw NotFoundException when deleting non-existent category', async () => {
      await expect(
        categoryService.deleteCategory(randomUUID()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findPageableCategories', () => {
    beforeEach(async () => {
      await categoryService.createCategory({
        name: 'Alpha Category',
        description: 'First category',
        createdById: testUserId,
      });
      await categoryService.createCategory({
        name: 'Beta Category',
        description: 'Second category',
        createdById: testUserId,
      });
    });

    it('should return all pageable categories without filters', async () => {
      const filter = new CategoryFilterDto();
      filter.pageNumber = 1;
      filter.pageSize = 10;

      const result = await categoryService.findPageableCategories(filter);

      expect(result.content.length).toBeGreaterThanOrEqual(2);
      expect(result.totalCount).toBeGreaterThanOrEqual(2);
    });

    it('should filter categories by search term', async () => {
      const filter = new CategoryFilterDto();
      filter.pageNumber = 1;
      filter.pageSize = 10;
      filter.search = 'Alpha';

      const result = await categoryService.findPageableCategories(filter);

      expect(result.content.length).toBe(1);
      expect(result.content[0].name).toBe('Alpha Category');
    });

    it('should paginate correctly', async () => {
      const filterPage1 = new CategoryFilterDto();
      filterPage1.pageNumber = 1;
      filterPage1.pageSize = 1;

      const res1 = await categoryService.findPageableCategories(filterPage1);
      expect(res1.content.length).toBe(1);

      const filterPage2 = new CategoryFilterDto();
      filterPage2.pageNumber = 2;
      filterPage2.pageSize = 1;

      const res2 = await categoryService.findPageableCategories(filterPage2);
      expect(res2.content.length).toBe(1);
      expect(res1.content[0].id).not.toBe(res2.content[0].id);
    });
  });
});
