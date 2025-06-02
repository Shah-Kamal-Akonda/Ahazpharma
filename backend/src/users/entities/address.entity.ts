import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.addresses)
  user: User;

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
}