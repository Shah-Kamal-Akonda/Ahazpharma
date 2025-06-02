import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { QuantityUnit } from '../entities/product.entity';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;


    @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(QuantityUnit)
  quantityUnit?: QuantityUnit;
}