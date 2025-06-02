import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Address } from './address.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true, type: 'date' })
  birthdate: Date;

  @Column({ default: 'user' })
  role: 'user' | 'admin';


  @Column({ type: 'varchar', nullable: true })
  resetCode: string | null; // Allow null




  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses: Address[];
}