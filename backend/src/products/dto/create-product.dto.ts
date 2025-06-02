import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { QuantityUnit } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

 @IsOptional()
  @IsString()
  categoryName?: string;

  @IsNumber()
  quantity: number;


    @IsOptional()
  @IsString()
  image?: string;

  @IsEnum(QuantityUnit)
  quantityUnit: QuantityUnit;
}