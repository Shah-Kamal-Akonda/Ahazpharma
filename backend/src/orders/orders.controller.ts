// backend/src/orders/orders.controller.ts
import { Controller, Post, Get, Body, Req, UnauthorizedException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Req() request: Request,
    @Body()
    body: {
      items: { productId: number; name: string; quantity: number; price: number }[];
      total: number;
      addressId: string;
    },
  ) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('No token provided');
    return this.ordersService.createOrder(token, body.items, body.total, body.addressId);
  }

  @Get('addresses')
  async getAddresses(@Req() request: Request) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('No token provided');
    return this.ordersService.getUserAddresses(token);
  }
}