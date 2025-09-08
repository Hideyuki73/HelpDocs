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

  @Post()
  create(@Body() createDocumentoDto: CreateDocumentoDto) {
    return this.documentoService.create(createDocumentoDto);
  }

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

  @Get()
  findAll(@Query('usuarioId') usuarioId: string) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.documentoService.findAll(usuarioId);
  }

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

  @Get('stats')
  getStats(@Query('usuarioId') usuarioId: string) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.documentoService.getDocumentoStats(usuarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('usuarioId') usuarioId: string) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.documentoService.findOne(id, usuarioId);
  }

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

  @Delete(':id')
  remove(@Param('id') id: string, @Query('usuarioId') usuarioId: string) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.documentoService.remove(id, usuarioId);
  }

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

  @Get('disponiveis-para-equipe')
  async findDocumentosDisponiveisParaEquipe(
    @Query('usuarioId') usuarioId: string,
  ) {
    if (!usuarioId) {
      throw new BadRequestException('usuarioId é obrigatório');
    }
    return this.documentoService.findDocumentosDisponiveisParaEquipe(usuarioId);
  }
}
