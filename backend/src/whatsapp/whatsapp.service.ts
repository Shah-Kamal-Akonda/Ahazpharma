import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class WhatsappService {
  private readonly instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  private readonly token = process.env.ULTRAMSG_TOKEN;
  private readonly baseUrl = `https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE_ID}/messages`;

  async sendWhatsAppMessage(phone: string, message: string): Promise<void> {
    try {
      await axios.post(
        this.baseUrl,
        {
          token: this.token,
          to: phone,
          body: message,
          priority: 10,
          referenceId: `order_${Date.now()}`
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('WhatsApp send error:', error.response?.data || error.message);
    }
  }
}
