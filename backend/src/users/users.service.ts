import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { PasswordResetDto } from './dto/reset-password.dto';
import { bangladeshAddresses, divisions, getDistricts, getCities } from './data/Bangladesh-address';

@Injectable()
export class UsersService {
  private verificationCodes: Map<string, string> = new Map();
  private pendingUsers: Map<string, CreateUserDto> = new Map();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    private jwtService: JwtService,
    private mailerService: MailerService, // Inject MailerService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    const { email } = createUserDto;
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    this.pendingUsers.set(email, createUserDto);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationCodes.set(email, code);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Ahaz Pharma',
        text: `Welcome to Ahaz Pharma!\n\nYour verification code is: ${code}`,
      });
      console.log('Signup verification email sent to:', email);
    } catch (error) {
      console.error('Signup email sending error:', error);
      throw new BadRequestException('Failed to send verification email');
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    const { email, code } = verifyEmailDto;
    const storedCode = this.verificationCodes.get(email);
    if (!storedCode || storedCode !== code) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const pendingUser = this.pendingUsers.get(email);
    if (!pendingUser) {
      throw new BadRequestException('No pending user found for this email');
    }

    const hashedPassword = await bcrypt.hash(pendingUser.password, 10);
    const user = this.userRepository.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: hashedPassword,
      phoneNumber: pendingUser.phoneNumber,
      isVerified: true,
    });
    await this.userRepository.save(user);

    this.verificationCodes.delete(email);
    this.pendingUsers.delete(email);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !user.isVerified) {
      throw new UnauthorizedException('Invalid credentials or email not verified');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserProfile(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['addresses'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, updateDto: UpdateAccountDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateDto.password) {
      user.password = await bcrypt.hash(updateDto.password, 10);
    }
    if (updateDto.email) {
      const existingEmail = await this.userRepository.findOne({ where: { email: updateDto.email } });
      if (existingEmail && existingEmail.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
      user.email = updateDto.email;
    }
    if (updateDto.phoneNumber) {
      user.phoneNumber = updateDto.phoneNumber;
    }
    if (updateDto.gender) {
      user.gender = updateDto.gender;
    }
    if (updateDto.birthdate) {
      user.birthdate = new Date(updateDto.birthdate);
    }

    await this.userRepository.save(user);
  }

  async uploadProfilePicture(userId: string, filename: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.profilePicture = filename;
    await this.userRepository.save(user);
  }

  // for reset password email verification
  async sendResetCode(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    await this.userRepository.save(user);

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password Reset Verification Code',
        text: `Your password reset code is: ${code}`,
      });
      console.log('Password reset email sent to:', user.email);
    } catch (error) {
      console.error('Password reset email sending error:', error);
      throw new BadRequestException('Failed to send verification code');
    }

    return { message: 'Verification code sent' };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || user.resetCode !== code) {
      throw new UnauthorizedException('Invalid or expired code');
    }
    return { message: 'Code verified, proceed to reset password' };
  }

  async resetPassword(resetDto: PasswordResetDto) {
    const { code, newPassword } = resetDto;
    const user = await this.userRepository.findOne({ where: { resetCode: code } });
    if (!user) {
      throw new NotFoundException('Invalid or expired code');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = null;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  async createAddress(userId: string, createAddressDto: CreateAddressDto): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!divisions.includes(createAddressDto.division)) {
      throw new BadRequestException('Invalid division');
    }
    if (!getDistricts(createAddressDto.division).includes(createAddressDto.district)) {
      throw new BadRequestException('Invalid district');
    }
    if (!getCities(createAddressDto.division, createAddressDto.district).includes(createAddressDto.city)) {
      throw new BadRequestException('Invalid city');
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      user,
    });
    await this.addressRepository.save(address);
    return address.id;
  }

  async updateAddress(userId: string, addressId: string, updateAddressDto: UpdateAddressDto): Promise<void> {
    const address = await this.addressRepository.findOne({ where: { id: addressId, user: { id: userId } } });
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (updateAddressDto.division && !divisions.includes(updateAddressDto.division)) {
      throw new BadRequestException('Invalid division');
    }
    if (updateAddressDto.district && updateAddressDto.division && !getDistricts(updateAddressDto.division).includes(updateAddressDto.district)) {
      throw new BadRequestException('Invalid district');
    }
    if (updateAddressDto.city && updateAddressDto.division && updateAddressDto.district && !getCities(updateAddressDto.division, updateAddressDto.district).includes(updateAddressDto.city)) {
      throw new BadRequestException('Invalid city');
    }

    Object.assign(address, updateAddressDto);
    await this.addressRepository.save(address);
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.addressRepository.findOne({ where: { id: addressId, user: { id: userId } } });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    await this.addressRepository.delete(addressId);
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return await this.addressRepository.find({ where: { user: { id: userId } } });
  }

  getDivisions(): string[] {
    return divisions;
  }

  getDistricts(division: string): string[] {
    return getDistricts(division);
  }

  getCities(division: string, district: string): string[] {
    return getCities(division, district);
  }
}