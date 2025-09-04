import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class UploadDocumentoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsNotEmpty()
  arquivoUrl: string;

  @IsString()
  @IsNotEmpty()
  nomeArquivo: string;

  @IsNumber()
  tamanhoArquivo: number;

  @IsString()
  @IsNotEmpty()
  empresaId: string;

  @IsString()
  @IsNotEmpty()
  equipeId: string;

  @IsString()
  @IsNotEmpty()
  criadoPor: string;
}
