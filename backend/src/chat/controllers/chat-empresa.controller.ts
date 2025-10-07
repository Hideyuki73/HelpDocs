import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ChatEmpresaService } from '../services/chat-empresa.service';
import { CreateChatEmpresaDto } from '../dto/create-chat-empresa.dto';
import { CreateMensagemDto } from '../dto/create-mensagem.dto';
import { UpdateMensagemDto } from '../dto/update-mensagem.dto';

@Controller('chats/empresa')
export class ChatEmpresaController {
  constructor(private readonly chatEmpresaService: ChatEmpresaService) {}

  // 🔹 Criar chat de empresa
  @Post()
  criarChatEmpresa(@Body() createChatEmpresaDto: CreateChatEmpresaDto) {
    return this.chatEmpresaService.criarChatEmpresa(createChatEmpresaDto);
  }

  // 🔹 Listar chats da empresa do usuário
  @Get('/empresa')
  listarChatsEmpresa(@Query('usuarioId') usuarioId: string) {
    console.log('listarChatsEmpresa', { usuarioId });
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.chatEmpresaService.listarChatsEmpresa(usuarioId);
  }

  // 🔹 Obter chat específico
  @Get(':chatId')
  obterChatEmpresa(
    @Param('chatId') chatId: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    console.log('obterChatEmpresa', { chatId, usuarioId });
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.chatEmpresaService.obterChatEmpresa(chatId, usuarioId);
  }

  // 🔹 Enviar mensagem
  @Post(':chatId/mensagens')
  enviarMensagem(
    @Param('chatId') chatId: string,
    @Body() createMensagemDto: CreateMensagemDto,
  ) {
    // Garantir que o chatId da URL seja usado
    createMensagemDto.chatId = chatId;
    createMensagemDto.tipoChat = 'empresa';
    return this.chatEmpresaService.enviarMensagem(createMensagemDto);
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
    return this.chatEmpresaService.listarMensagens(
      chatId,
      usuarioId,
      limiteNum,
    );
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
    return this.chatEmpresaService.editarMensagem(
      mensagemId,
      updateMensagemDto,
      usuarioId,
    );
  }

  // 🔹 Deletar mensagem
  @Delete('mensagens/:mensagemId')
  deletarMensagem(
    @Param('mensagemId') mensagemId: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.chatEmpresaService.deletarMensagem(mensagemId, usuarioId);
  }
}
