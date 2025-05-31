import { Module } from '@nestjs/common';
import { MensagemService } from './mensagem.service';
import { MensagemController } from './mensagem.controller';

@Module({
  controllers: [MensagemController],
  providers: [MensagemService],
  exports: [MensagemService],
})
export class MensagemModule {}
