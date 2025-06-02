import { Controller, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send')
  async sendWhatsApp(@Body() body: { phone: string; message: string }) {
    await this.whatsappService.sendWhatsAppMessage(body.phone, body.message);
    return { success: true };
  }


   
}
