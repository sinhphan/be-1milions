import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getCategories(@Query() p: { limit: number; page: number }) {
    return this.categoryService.selectCategories(p);
  }

  @Post('search')
  async search(@Body() p: { search: string }) {
    return this.categoryService.search(p);
  }
}
