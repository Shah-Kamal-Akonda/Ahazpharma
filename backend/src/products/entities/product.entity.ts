import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './category.entity';

export enum QuantityUnit {
  ML = 'ML',
  GM = 'GM',
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: number;

  @Column({ type: 'float' })
  quantity: number;


    @Column({ nullable: true })
  image: string; // <-- New field

  @Column({ type: 'enum', enum: QuantityUnit })
  quantityUnit: QuantityUnit;
}