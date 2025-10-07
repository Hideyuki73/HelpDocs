import { Module } from '@nestjs/common';
import { ChatEquipeService } from './services/chat-equipe.service';
import { ChatEmpresaService } from './services/chat-empresa.service';
import { ChatEquipeController } from './controllers/chat-equipe.controller';
import { ChatEmpresaController } from './controllers/chat-empresa.controller';

@Module({
  controllers: [ChatEquipeController, ChatEmpresaController],
  providers: [ChatEquipeService, ChatEmpresaService],
  exports: [ChatEquipeService, ChatEmpresaService],
})
export class ChatModule {}
