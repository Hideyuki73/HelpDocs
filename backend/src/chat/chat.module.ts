import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatEquipeService } from './services/chat-equipe.service';
import { ChatEmpresaService } from './services/chat-empresa.service';
import { ChatEquipeController } from './controllers/chat-equipe.controller';
import { ChatEmpresaController } from './controllers/chat-empresa.controller';

@Module({
  controllers: [
    ChatController,
    ChatEquipeController,
    ChatEmpresaController,
  ],
  providers: [
    ChatService,
    ChatEquipeService,
    ChatEmpresaService,
  ],
  exports: [
    ChatService,
    ChatEquipeService,
    ChatEmpresaService,
  ],
})
export class ChatModule {}
