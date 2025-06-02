import { IsOptional, IsString, IsEmail, IsDateString, IsEnum } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;
}