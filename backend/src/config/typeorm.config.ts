import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Category } from '../products/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { Address } from '../users/entities/address.entity';
import { Order } from 'src/orders/entities/orders.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'Kamal2093@',
  database: process.env.DATABASE_NAME || 'AhazPharma',
  entities: [Product, Category, User, Address,Order],
  synchronize: true, // Set to false in production
  logging: true, // Enable logging for debugging
  ssl: {
    rejectUnauthorized: false, // This disables certificate validation (safe for testing)
  },
};