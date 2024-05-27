import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, default: null })
  parentId: number;

  @OneToMany(() => CategoryEntity, (category) => category.parentId)
  children: CategoryEntity[];

  @Column({
    nullable: true,
    default: null
  })
  path: string;

  @Column({
    nullable: true,
    default: null
  })
  depth: number;

  isSearch?: boolean
}
