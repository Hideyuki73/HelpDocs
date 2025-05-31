import { Module } from '@nestjs/common';
import { VersaoDocumentoService } from './versao-documento.service';
import { VersaoDocumentoController } from './versao-documento.controller';

@Module({
  controllers: [VersaoDocumentoController],
  providers: [VersaoDocumentoService],
  exports: [VersaoDocumentoService],
})
export class VersaoDocumentoModule {}
