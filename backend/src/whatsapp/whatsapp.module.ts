import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controllet';

@Module({
  providers: [WhatsappService],
  exports: [WhatsappService],
  controllers: [WhatsappController],
})
export class WhatsappModule {}
