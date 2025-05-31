import { IsString } from 'class-validator';

export class CreateMensagemDto {
  @IsString()
  chatId: string;

  @IsString()
  conteudo: string;

  @IsString()
  enviadoPor: string;
}
