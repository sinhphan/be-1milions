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
    for (let i = 0; i < 100; i++) {
      const category = new CategoryEntity();
      category.name = `Category ${i}`;
      categories.push(category);
    }
    await this.categoryRepository.save(categories);

    let id = 1;
    for (let i = 100; i < 1000000; i++) {
      const category = this.categoryRepository.create({
        name: `Category ${i}`,
        parentId: id,
      });
      await this.categoryRepository.save(category);
      if (i != 1 && i % 10 == 0) {
        id += 1;
      }
      console.log(`Added category ${i} --- ${id}`);
    }
  }

  async search(p) {
    const count = await this.categoryRepository.query(
      `WITH RECURSIVE category_tree AS (
        SELECT id, name, parentId, CAST(id AS CHAR(255)) AS path, 1 AS depth
        FROM categories
        WHERE parentId IS NULL
    
        UNION ALL
    
        SELECT c.id, c.name, c.parentId, CONCAT(ct.path, ',', c.id), ct.depth + 1
        FROM categories c
        JOIN category_tree ct ON c.parentId = ct.id
        WHERE ct.depth < 5
      )
      SELECT * FROM category_tree
      WHERE name LIKE ?
      ORDER BY path;`,
      [`%${p.search}%`],
    );
    return count;
  }

  async selectCategories(p) {
    const page = p.page || 1;
    const offset = p.limit * (page - 1);

    const count = await this.categoryRepository.query(
      `WITH RECURSIVE category_tree AS (
      SELECT id, name, parentId, CAST(id AS CHAR(255)) AS path, 1 AS depth
      FROM categories
      WHERE parentId IS NULL
    
      UNION ALL
    
      SELECT c.id, c.name, c.parentId, CONCAT(ct.path, ',', c.id), ct.depth + 1
      FROM categories c
      JOIN category_tree ct ON c.parentId = ct.id
      WHERE ct.depth < 5
    )
    SELECT * FROM category_tree
    ORDER BY path
    LIMIT ? OFFSET ?`,
      [+p.limit, +offset],
    );
    return count;
  }

  async onModuleInit() {
    // await this.addCategories()
  }
}
