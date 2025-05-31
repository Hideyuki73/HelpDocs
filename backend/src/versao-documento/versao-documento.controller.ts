import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { VersaoDocumentoService } from './versao-documento.service';
import { CreateVersaoDocumentoDto } from './dto/create-versao-documento.dto';
import { UpdateVersaoDocumentoDto } from './dto/update-versao-documento.dto';

@Controller('versoes-documento')
export class VersaoDocumentoController {
  constructor(
    private readonly versaoDocumentoService: VersaoDocumentoService,
  ) {}

  @Post()
  create(@Body() createVersaoDocumentoDto: CreateVersaoDocumentoDto) {
    return this.versaoDocumentoService.create(createVersaoDocumentoDto);
  }

  @Get()
  findAll() {
    return this.versaoDocumentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.versaoDocumentoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVersaoDocumentoDto: UpdateVersaoDocumentoDto,
  ) {
    return this.versaoDocumentoService.update(id, updateVersaoDocumentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.versaoDocumentoService.remove(id);
  }
}
