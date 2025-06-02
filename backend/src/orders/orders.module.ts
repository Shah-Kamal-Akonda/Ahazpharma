import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/orders.entity';
import { User } from '../users/entities/user.entity';
import { Address } from '../users/entities/address.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Address]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: configService.get('EMAIL_USER'),
            pass: configService.get('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"Ahaz Pharma" <no-reply@ahazpharma.com>',
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in OrdersModule');
        }
        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
    ConfigModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService,WhatsappService],
})
export class OrdersModule {}