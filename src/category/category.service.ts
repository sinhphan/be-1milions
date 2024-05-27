import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { CategoryEntity } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async addCategories() {
    const categories: CategoryEntity[] = [];
    for (let i = 1; i <= 100; i++) {
      const category = new CategoryEntity();
      category.name = `Category ${i}`;
      categories.push(category);
    }
    await this.categoryRepository.save(categories);

    let id = 1;
    let data = [];
    for (let i = 101; i <= 1111111; i++) {
      const category = this.categoryRepository.create({
        name: `Category ${i}`,
        parentId: id,
      });
      data?.push(category);
      if (i != 1 && i % 10 == 0) {
        id += 1;
      }
      if (i % 1000 === 0) {
        await this.categoryRepository.save(data);
        data = [];
        console.log('🚀 => CategoryService => addCategories => i:', i);
      }
    }
  }

  async updatePathAndDepth() {
    await this.categoryRepository.query(`
    WITH RECURSIVE category_tree AS (
      SELECT id, name, parentId, CAST(id AS CHAR(255)) AS path, 1 AS depth
      FROM categories
      WHERE parentId IS NULL
    
      UNION ALL
    
      SELECT c.id, c.name, c.parentId, CONCAT(ct.path, ',', c.id), ct.depth + 1
      FROM categories c
      JOIN category_tree ct ON c.parentId = ct.id
      WHERE ct.depth < 5
    )
    UPDATE categories
    JOIN category_tree ON categories.id = category_tree.id
    SET categories.path = category_tree.path,
      categories.depth = category_tree.depth;
    `);
    console.log('🚀 => CategoryService => DONE====');
  }

  async search(p) {
    if (!p.keyword) {
      return [];
    }
    const page = Number.isInteger(+p.page) && p.page > 0 ? p.page : 1;
    const offset = p.limit * (page - 1);
    const [categories, total] = await this.categoryRepository.findAndCount({
      where: { name: Like(`%${p.keyword}%`) },
      skip: offset,
      take: p.limit || 30,
    });

    const result = categories?.map((r) => {
      r.isSearch = true;
      return r;
    });
    for (const category of categories) {
      const parent = await this.categoryRepository.find({
        where: { id: In(category.path?.split(',')) },
      });
      parent.forEach((p) => {
        if (!result?.some((c) => c.id == p.id)) {
          result.push(p);
        }
      });
    }
    return {
      data: result.sort((a, b) => {
        if (a.path < b.path) {
          return -1;
        }
        if (a.path > b.path) {
          return 1;
        }
        return 0;
      }),
      total,
      page,
    };
  }

  async onModuleInit() {
    // await this.addCategories();
    // await this.updatePathAndDepth()
  }
}
