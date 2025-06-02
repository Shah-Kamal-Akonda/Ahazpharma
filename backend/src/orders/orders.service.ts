import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/orders.entity';
import { User } from '../users/entities/user.entity';
import { Address } from '../users/entities/address.entity';
import { JwtService } from '@nestjs/jwt';

import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';


@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService,
    private whatsappService: WhatsappService,
    
  ) {}


  
  

  async createOrder(
    token: string,
    items: { productId: number; name: string; quantity: number; price: number }[],
    total: number,
    addressId: string,
  ): Promise<Order> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
        relations: ['addresses'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const address = await this.addressRepository.findOne({ where: { id: addressId } });
      if (!address) {
        throw new UnauthorizedException('Address not found');
      }

      const order = this.ordersRepository.create({
        user,
        items,
        total,
        division: address.division,
        district: address.district,
        city: address.city,
        addressLine: address.addressLine,
        recipientName: address.recipientName,
        phoneNumber: address.phoneNumber,
        email: address.email,
        status: 'Processing',
        createdAt: new Date(),
      });

      const savedOrder = await this.ordersRepository.save(order);

      await this.sendOrderEmails(savedOrder, user, address);


         // ✅ WhatsApp START
    try {
      const itemsText = savedOrder.items
        ?.map((item: any) => `- ${item.name} x${item.quantity}`)
        .join('\n') || 'No items';

      const message = `🛒 *New Order Summary*\n` +
        `👤 Name: ${address.recipientName}\n` +
        `📞 Phone: ${address.phoneNumber}\n` +
        `📧 Email: ${address.email}\n` +
        `💰 Total: $${savedOrder.total.toFixed(2)}\n` +
        `📦 Items:\n${itemsText}`;

      // Send to customer
      await this.whatsappService.sendWhatsAppMessage(address.phoneNumber, message);

      // Send to admin
      const adminNumber = this.configService.get<string>('ULTRAMSG_ADMIN_NUMBER');
      if (adminNumber) {
        await this.whatsappService.sendWhatsAppMessage(adminNumber, message);
      }
    } catch (whatsAppError) {
      console.error('⚠️ WhatsApp Message Failed:', whatsAppError.message);
    }
    // ✅ WhatsApp END
      return savedOrder;
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid or missing JWT token');
      }
      throw error;
    }
  }

  async getUserAddresses(token: string): Promise<Address[]> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
        relations: ['addresses'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user.addresses;
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid or missing JWT token');
      }
      throw error;
    }
  }

  private async sendOrderEmails(order: Order, user: User, address: Address) {
    const itemsList = order.items
      .map((item) => `${item.name} (x${item.quantity}) - $${item.price * item.quantity}`)
      .join('\n');

    const emailContent = `
      Order ID: ${order.id}
      Date: ${order.createdAt.toLocaleDateString()}
      Items:
      ${itemsList}
      Total: $${order.total.toFixed(2)}
      Shipping Address:
      ${address.recipientName}
      ${address.addressLine}, ${address.city}, ${address.district}, ${address.division}
      Phone: ${address.phoneNumber}
      Email: ${address.email}
    `;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Your Ahaz Pharma Order Confirmation',
      text: `Dear ${user.name},\n\nThank you for your order!\n\n${emailContent}\n\nBest regards,\nAhaz Pharma`,
    });

    await this.mailerService.sendMail({
      to: this.configService.get('OWNER_EMAIL'),
      subject: `New Order #${order.id}`,
      text: `New order received from ${user.email}:\n\n${emailContent}`,
    });
  }




  

}