import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
  const { categoryName, ...productData } = createProductDto;
  const product = this.productRepository.create(productData);

  if (categoryName) {
    const category = await this.categoryRepository.findOne({ where: { name: categoryName } });
    if (!category) throw new NotFoundException(`Category with name "${categoryName}" not found`);
    product.category = category;
  }

  return this.productRepository.save(product);
}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['category'] });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['category'] });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: updateProductDto.categoryId } });
      if (!category) throw new NotFoundException(`Category with ID ${updateProductDto.categoryId} not found`);
      product.category = category;
    }
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async searchByName(name: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { name: Like(`%${name}%`) },
      relations: ['category'],
    });
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException(`Category with ID ${categoryId} not found`);
    return this.productRepository.find({ where: { category: { id: categoryId } }, relations: ['category'] });
  }
}