import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

    @Column({ nullable: true })
  image: string; // <-- New field

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}