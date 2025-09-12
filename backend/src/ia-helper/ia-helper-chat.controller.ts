import { Controller, Post, Body } from '@nestjs/common';
import { IaHelperChatService } from './ia-helper-chat.service';

export class ChatRequestDto {
  pergunta: string;
  contexto?: string;
}

export class SugestaoTituloDto {
  conteudo: string;
}

@Controller('ia-helper/chat')
export class IaHelperChatController {
  constructor(private readonly iaHelperChatService: IaHelperChatService) {}

  @Post('pergunta')
  async fazerPergunta(@Body() chatRequest: ChatRequestDto) {
    const resposta = await this.iaHelperChatService.gerarResposta(
      chatRequest.pergunta,
      chatRequest.contexto,
    );

    return {
      pergunta: chatRequest.pergunta,
      resposta,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('sugerir-titulo')
  async sugerirTitulo(@Body() sugestaoTitulo: SugestaoTituloDto) {
    const titulo = await this.iaHelperChatService.gerarSugestaoTitulo(
      sugestaoTitulo.conteudo,
    );

    return {
      titulo,
      timestamp: new Date().toISOString(),
    };
  }
}
