import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Address]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        console.log('UsersModule: JWT_SECRET:', secret ? 'present' : 'missing');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in UsersModule');
        }
        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const emailUser = configService.get<string>('EMAIL_USER');
        const emailPassword = configService.get<string>('EMAIL_PASSWORD');
        console.log('UsersModule: EMAIL_USER:', emailUser ? 'present' : 'missing');
        if (!emailUser || !emailPassword) {
          throw new Error('EMAIL_USER or EMAIL_PASSWORD is not defined in UsersModule');
        }
        return {
          transport: {
            service: 'gmail',
            auth: {
              user: emailUser,
              pass: emailPassword,
            },
          },
        };
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}