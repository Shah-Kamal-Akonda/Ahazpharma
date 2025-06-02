import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile, Request, UseGuards, ForbiddenException,BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { PasswordResetDto } from './dto/reset-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      await this.usersService.create(createUserDto);
      return { message: 'User created, please verify your email' };
    } catch (error) {
      throw error;
    }
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    try {
      await this.usersService.verifyEmail(verifyEmailDto);
      return { message: 'Email verified successfully' };
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.usersService.login(loginDto);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    try {
      return await this.usersService.getUserProfile(req.user.sub);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async updateProfile(@Request() req, @Body() updateDto: UpdateAccountDto) {
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
      throw new ForbiddenException('Invalid role');
    }
    try {
      await this.usersService.updateProfile(req.user.sub, updateDto);
      return { message: 'Profile updated successfully' };
    } catch (error) {
      throw error;
    }
  }

 // users.controller.ts
@UseGuards(JwtAuthGuard)
@Post('profile/photo')
@UseInterceptors(
  FileInterceptor('photo', {
    storage: diskStorage({
      destination: './Uploads',
      filename: (req, file, cb) => {
        const ext = extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif)$/)) {
        cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
  }),
)
async uploadProfilePicture(@Request() req, @UploadedFile() file: Express.Multer.File) {
  if (req.user.role !== 'user' && req.user.role !== 'admin') {
    throw new ForbiddenException('Invalid role');
  }
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }
  try {
    await this.usersService.uploadProfilePicture(req.user.sub, file.filename);
    return { url: `/Uploads/${file.filename}` }; // Return URL like admin panel
  } catch (error) {
    throw error;
  }
}


   // for reset password and verirfy email
@Post('send-reset-code')
  async sendResetCode(@Body('email') email: string) {
    return this.usersService.sendResetCode(email);
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body() body: { email: string; code: string }) {
    return this.usersService.verifyResetCode(body.email, body.code);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetDto: PasswordResetDto) {
    return this.usersService.resetPassword(resetDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('address')
  async createAddress(@Request() req, @Body() createAddressDto: CreateAddressDto) {
    if (req.user.role !== 'user') {
      throw new ForbiddenException('Only users can manage addresses');
    }
    try {
      const addressId = await this.usersService.createAddress(req.user.sub, createAddressDto);
      return { message: 'Address created successfully', addressId };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('address/:id')
  async updateAddress(@Request() req, @Param('id') addressId: string, @Body() updateAddressDto: UpdateAddressDto) {
    if (req.user.role !== 'user') {
      throw new ForbiddenException('Only users can manage addresses');
    }
    try {
      await this.usersService.updateAddress(req.user.sub, addressId, updateAddressDto);
      return { message: 'Address updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('address/:id')
  async deleteAddress(@Request() req, @Param('id') addressId: string) {
    if (req.user.role !== 'user') {
      throw new ForbiddenException('Only users can manage addresses');
    }
    try {
      await this.usersService.deleteAddress(req.user.sub, addressId);
      return { message: 'Address deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('address')
  async getAddresses(@Request() req) {
    if (req.user.role !== 'user') {
      throw new ForbiddenException('Only users can view addresses');
    }
    try {
      return await this.usersService.getAddresses(req.user.sub);
    } catch (error) {
      throw error;
    }
  }

  @Get('divisions')
  getDivisions() {
    return this.usersService.getDivisions();
  }

  @Get('districts/:division')
  getDistricts(@Param('division') division: string) {
    return this.usersService.getDistricts(division);
  }

  @Get('cities/:division/:district')
  getCities(@Param('division') division: string, @Param('district') district: string) {
    return this.usersService.getCities(division, district);
  }
}