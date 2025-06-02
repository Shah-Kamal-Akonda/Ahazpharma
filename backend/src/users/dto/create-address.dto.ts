import { IsString, IsEmail } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  division: string;

  @IsString()
  district: string;

  @IsString()
  city: string;

  @IsString()
  addressLine: string;

  @IsString()
  recipientName: string;

  @IsString()
  phoneNumber: string;

  @IsEmail()
  email: string;
}