import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Category } from '../products/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { Address } from '../users/entities/address.entity';
import { Order } from 'src/orders/entities/orders.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || `postgres://${process.env.DATABASE_USER || 'postgres'}:${process.env.DATABASE_PASSWORD || 'Kamal2093@'}@${process.env.DATABASE_HOST || 'localhost'}:${process.env.DATABASE_PORT || '5432'}/${process.env.DATABASE_NAME || 'AhazPharma'}`,
  entities: [Product, Category, User, Address, Order],
  synchronize: process.env.NODE_ENV === 'production' ? false : true, // Disable synchronize in production
  logging: true,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Enable SSL only in production
};