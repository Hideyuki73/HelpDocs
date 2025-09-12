import { Module } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { DocumentoController } from './documento.controller';
import { EquipeModule } from '../equipes/equipe.module';

@Module({
  controllers: [DocumentoController],
  providers: [DocumentoService],
  imports: [EquipeModule],
  exports: [DocumentoService],
})
export class DocumentoModule {}
