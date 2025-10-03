import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum TipoChat {
  EQUIPE = 'equipe',
  EMPRESA = 'empresa',
}

export class CreateMensagemDto {
  @IsString()
  @IsNotEmpty()
  conteudo: string;

  @IsString()
  @IsNotEmpty()
  autorId: string;

  @IsOptional()
  @IsString()
  nomeAutor?: string;

  @IsOptional()
  @IsString()
  chatId?: string;

  @IsOptional()
  @IsEnum(TipoChat)
  tipoChat?: 'equipe' | 'empresa';
}
