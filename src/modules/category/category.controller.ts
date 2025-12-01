import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFilterDto } from './dto/category-filter.dto';
import { ResponseMessage, UserDetails } from 'src/decorators';
import { AuthGuard } from 'src/guards/user.guard';
import { UserEntity } from '../user/user.entity';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { createCategorySchema } from './schemas/create-category.schema';
import { updateCategorySchema } from './schemas/update-category.schema';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories with pagination and search' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  @ResponseMessage('Categories retrieved successfully')
  async getCategories(@Query() categoryFilterDto: CategoryFilterDto) {
    return this.categoryService.findPageableCategories(categoryFilterDto);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ResponseMessage('Category created successfully')
  async createCategory(
    @Body(
      new ValidationPipe(createCategorySchema)
    ) createCategoryDto: CreateCategoryDto,
    @UserDetails() user: UserEntity,
  ) {
    createCategoryDto.createdById = user.id;
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ResponseMessage('Category found successfully')
  async getCategoryById(@Param('id') categoryId: string) {
    return this.categoryService.findCategoryByIdOrThrow(categoryId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe(updateCategorySchema))
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ResponseMessage('Category updated successfully')
  async updateCategory(
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(categoryId, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ResponseMessage('Category deleted successfully')
  async deleteCategory(@Param('id') categoryId: string) {
    return this.categoryService.deleteCategory(categoryId);
  }
}
