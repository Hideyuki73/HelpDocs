import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateMensagemDto {
  @IsString()
  @IsNotEmpty()
  conteudo: string;

  @IsString()
  @IsNotEmpty()
  autorId: string;

  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsEnum(['equipe', 'empresa'])
  tipoChat: 'equipe' | 'empresa';
}
