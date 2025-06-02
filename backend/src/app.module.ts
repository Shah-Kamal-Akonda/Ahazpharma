import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig } from './config/typeorm.config';
import { envConfig } from './config/env.config';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot(envConfig),
    TypeOrmModule.forRoot(typeOrmConfig),
    ProductsModule,
    CategoriesModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    WhatsappModule
  ],
})
export class AppModule {}