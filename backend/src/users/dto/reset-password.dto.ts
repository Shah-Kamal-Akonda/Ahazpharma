import { IsString, MinLength } from 'class-validator';

export class PasswordResetDto {
  @IsString()
  code: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword: string;
}