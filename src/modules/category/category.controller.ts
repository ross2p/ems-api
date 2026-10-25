import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFilterDto } from './dto/category-filter.dto';
import { CategoryEntity } from './category.entity';
import {
  ApiAuth,
  ApiErrorResponse,
  ApiPageResponse,
  ApiSuccessResponse,
  ResponseMessage,
  UserDetails,
} from '../../decorators';
import { AuthGuard } from '../../guards/user.guard';
import { UserEntity } from '../user/user.entity';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { createCategorySchema } from './schemas/create-category.schema';
import { updateCategorySchema } from './schemas/update-category.schema';
import { uuidSchema } from '../../schemas/uuid.schema';
import { categoryFilterSchema } from './schemas/category-filter.schema';

@ApiTags('Categories')
@ApiAuth()
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get categories',
    description: 'Paginated categories with search by name.',
  })
  @ApiPageResponse({
    type: CategoryEntity,
    description: 'Categories retrieved successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid query parameters or access token is invalid or expired',
  })
  @ResponseMessage('Categories retrieved successfully')
  async getCategories(
    @Query(new ValidationPipe(categoryFilterSchema))
    categoryFilterDto: CategoryFilterDto,
  ) {
    return this.categoryService.findPageableCategories(categoryFilterDto);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create category',
    description: 'Creates a category owned by the current user.',
  })
  @ApiSuccessResponse({
    type: CategoryEntity,
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Validation failed, malformed JSON or access token is invalid or expired',
  })
  @ResponseMessage('Category created successfully')
  async createCategory(
    @Body(new ValidationPipe(createCategorySchema))
    createCategoryDto: CreateCategoryDto,
    @UserDetails() user: UserEntity,
  ) {
    createCategoryDto.createdById = user.id;
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category identifier',
    format: 'uuid',
  })
  @ApiSuccessResponse({
    type: CategoryEntity,
    description: 'Category found successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid category ID or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found or access token user not found',
  })
  @ResponseMessage('Category found successfully')
  async getCategoryById(
    @Param('id', new ValidationPipe(uuidSchema)) categoryId: string,
  ) {
    return this.categoryService.findCategoryByIdOrThrow(categoryId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update category',
    description: 'Updates only the provided fields.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category identifier',
    format: 'uuid',
  })
  @ApiSuccessResponse({
    type: CategoryEntity,
    description: 'Category updated successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid category ID, validation failed, malformed JSON or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found or access token user not found',
  })
  @ResponseMessage('Category updated successfully')
  async updateCategory(
    @Param('id', new ValidationPipe(uuidSchema)) categoryId: string,
    @Body(new ValidationPipe(updateCategorySchema))
    updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(categoryId, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Delete category',
    description: 'Deletes a category that no event uses, returns it.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category identifier',
    format: 'uuid',
  })
  @ApiSuccessResponse({
    type: CategoryEntity,
    description: 'Category deleted successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid category ID or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found or access token user not found',
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category is used by events',
  })
  @ResponseMessage('Category deleted successfully')
  async deleteCategory(
    @Param('id', new ValidationPipe(uuidSchema)) categoryId: string,
  ) {
    return this.categoryService.deleteCategory(categoryId);
  }
}
