import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async search(@Query() p: { limit: number; page: number; keyword: string }) {
    return this.categoryService.search(p);
  }
}
