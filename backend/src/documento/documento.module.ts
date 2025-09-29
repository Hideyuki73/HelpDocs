import { Module } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { DocumentoController } from './documento.controller';
import { EquipeModule } from '../equipes/equipe.module';
import { VersaoDocumentoModule } from '../versao-documento/versao-documento.module';

@Module({
  controllers: [DocumentoController],
  providers: [DocumentoService],
  imports: [EquipeModule, VersaoDocumentoModule],
  exports: [DocumentoService],
})
export class DocumentoModule {}
