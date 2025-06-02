// backend/src/orders/entities/order.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.addresses)
  user: User;

  @Column('json')
  items: { productId: number; name: string; quantity: number; price: number }[];

  @Column('float')
  total: number;

  @Column()
  division: string;

  @Column()
  district: string;

  @Column()
  city: string;

  @Column()
  addressLine: string;

  @Column()
  recipientName: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @Column()
  status: string;

  @Column()
  createdAt: Date;
}