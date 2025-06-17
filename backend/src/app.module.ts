import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL') || `postgres://${configService.get<string>('DATABASE_USER', 'postgres')}:${configService.get<string>('DATABASE_PASSWORD', 'Kamal2093@')}@${configService.get<string>('DATABASE_HOST', 'localhost')}:${configService.get<number>('DATABASE_PORT', 5432)}/${configService.get<string>('DATABASE_NAME', 'AhazPharma')}`,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') === 'production' ? false : true, // Disable synchronize in production
        logging: true,
        ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false, // Enable SSL only in production
      }),
    }),
    ProductsModule,
    CategoriesModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    WhatsappModule,
  ],
})
export class AppModule {}