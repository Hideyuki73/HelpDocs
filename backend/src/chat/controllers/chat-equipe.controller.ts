import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { ChatEquipeService } from '../services/chat-equipe.service';
import { CreateChatEquipeDto } from '../dto/create-chat-equipe.dto';
import { CreateMensagemDto } from '../dto/create-mensagem.dto';
import { UpdateMensagemDto } from '../dto/update-mensagem.dto';

@Controller('chats/equipe')
export class ChatEquipeController {
  constructor(private readonly chatEquipeService: ChatEquipeService) {}

  // 🔹 Criar chat de equipe
  @Post()
  criarChatEquipe(@Body() createChatEquipeDto: CreateChatEquipeDto) {
    return this.chatEquipeService.criarChatEquipe(createChatEquipeDto);
  }

  // 🔹 Listar chats de uma equipe
  @Get('equipe/:equipeId')
  listarChatsEquipe(
    @Param('equipeId') equipeId: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.chatEquipeService.listarChatsEquipe(equipeId, usuarioId);
  }

  // 🔹 Obter chat específico
  @Get(':chatId')
  obterChatEquipe(
    @Param('chatId') chatId: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.chatEquipeService.obterChatEquipe(chatId, usuarioId);
  }

  // 🔹 Enviar mensagem
  @Post(':chatId/mensagens')
  enviarMensagem(
    @Param('chatId') chatId: string,
    @Body() createMensagemDto: CreateMensagemDto,
  ) {
    // Garantir que o chatId da URL seja usado
    createMensagemDto.chatId = chatId;
    createMensagemDto.tipoChat = 'equipe';
    return this.chatEquipeService.enviarMensagem(createMensagemDto);
  }

  // 🔹 Listar mensagens do chat
  @Get(':chatId/mensagens')
  listarMensagens(
    @Param('chatId') chatId: string,
    @Query('usuarioId') usuarioId: string,
    @Query('limite') limite?: string,
  ) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    const limiteNum = limite ? parseInt(limite, 10) : 50;
    return this.chatEquipeService.listarMensagens(chatId, usuarioId, limiteNum);
  }

  // 🔹 Editar mensagem
  @Patch('mensagens/:mensagemId')
  editarMensagem(
    @Param('mensagemId') mensagemId: string,
    @Body() updateMensagemDto: UpdateMensagemDto,
    @Query('usuarioId') usuarioId: string,
  ) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.chatEquipeService.editarMensagem(mensagemId, updateMensagemDto, usuarioId);
  }
}
