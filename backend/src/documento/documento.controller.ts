import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentoService } from './documento.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { UploadDocumentoDto } from './dto/upload-documento.dto';

@Controller('documentos')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  // 🔹 Criar documento
  @Post()
  create(@Body() createDocumentoDto: CreateDocumentoDto) {
    return this.documentoService.create(createDocumentoDto);
  }

  // 🔹 Upload de arquivo
  @Post('upload')
  @UseInterceptors(FileInterceptor('arquivo'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentoDto: UploadDocumentoDto,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    const arquivoUrl = `https://storage.example.com/${file.filename}`;

    const uploadData: UploadDocumentoDto = {
      ...uploadDocumentoDto,
      arquivoUrl,
      nomeArquivo: file.originalname,
      tamanhoArquivo: file.size,
    };

    return this.documentoService.upload(uploadData);
  }

  // 🔹 Listar todos
  @Get()
  findAll(@Query('usuarioId') usuarioId: string) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.documentoService.findAll(usuarioId);
  }

  // 🔹 Documentos disponíveis para equipe
  @Get('disponiveis-para-equipe')
  async findDocumentosDisponiveisParaEquipe(
    @Query('usuarioId') usuarioId: string,
  ) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.documentoService.findDocumentosDisponiveisParaEquipe(usuarioId);
  }

  // 🔹 Documentos por equipe
  @Get('equipe/:equipeId')
  findByEquipe(
    @Param('equipeId') equipeId: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.documentoService.findByEquipe(equipeId, usuarioId);
  }

  // 🔹 Estatísticas
  @Get('stats')
  getStats(@Query('usuarioId') usuarioId: string) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.documentoService.getDocumentoStats(usuarioId);
  }

  // 🔹 Remover
  @Delete(':id')
  remove(@Param('id') id: string, @Query('usuarioId') usuarioId: string) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.documentoService.remove(id, usuarioId);
  }

  // 🔹 Buscar por ID (vem por último para não engolir rotas fixas)
  @Get(':slug')
  findOne(@Param('slug') slug: string, @Query('usuarioId') usuarioId: string) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.documentoService.findOne(slug, usuarioId);
  }

  // 🔹 Atualizar
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentoDto: UpdateDocumentoDto,
    @Query('usuarioId') usuarioId: string,
  ) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.documentoService.update(id, updateDocumentoDto, usuarioId);
  }

  // 🔹 Atribuir a equipe
  @Patch(':id/atribuir-equipe')
  async assignDocumentoToEquipe(
    @Param('id') id: string,
    @Body('equipeId') equipeId: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    if (!equipeId) {
      throw new BadRequestException('equipeId é obrigatório');
    }
    return this.documentoService.assignDocumentoToEquipe(
      id,
      equipeId,
      usuarioId,
    );
  }
}
