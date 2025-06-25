import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { CategoriesModule } from 'src/categories/categories.module';

//for upload image in cloudinary
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category]), CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService,CloudinaryService],
})
export class ProductsModule {}