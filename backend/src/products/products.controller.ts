import { Controller, Get, Post, Body, Param, Put, Delete, Query,BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

import {  UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

     @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    return { filename: file.filename, url: `/uploads/products/${file.filename}` };
  }
  
  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(+id);
  }

  // @Get('search/name')
  // searchByName(@Query('name') name: string): Promise<Product[]> {
  //   return this.productsService.searchByName(name);
  // }


    @Get('search/name')
  async searchByName(@Query('name') name: string): Promise<Product[]> {
    console.log(`Received search request for name: ${name}`);
    if (!name || name.trim() === '') {
      console.log('Empty search term, returning empty array');
      return [];
    }
    try {
      return await this.productsService.searchByName(name);
    } catch (error) {
      console.error('Error in searchByName controller:', error);
      throw new BadRequestException('Failed to search products');
    }
  }
  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string): Promise<Product[]> {
    return this.productsService.findByCategory(+categoryId);
  }
}