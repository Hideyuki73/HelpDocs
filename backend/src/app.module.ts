import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { EmpresaModule } from './empresa/empresa.module';
import { DocumentoModule } from './documento/documento.module';
import { VersaoDocumentoModule } from './versao-documento/versao-documento.module';
import { FuncionarioModule } from './funcionario/funcionario.module';
import { ChatModule } from './chat/chat.module';
import { MensagemModule } from './mensagem/mensagem.module';
import { IaHelperModule } from './ia-helper/ia-helper.module';
import { EquipeModule } from './equipes/equipe.module';
@Module({
  imports: [
    FirebaseModule,
    EmpresaModule,
    DocumentoModule,
    VersaoDocumentoModule,
    FuncionarioModule,
    ChatModule,
    MensagemModule,
    IaHelperModule,
    EquipeModule,
  ],
})
export class AppModule {}
