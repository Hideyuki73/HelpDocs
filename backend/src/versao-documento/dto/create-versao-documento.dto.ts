import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateVersaoDocumentoDto {
  @IsString()
  documentoId: string;

  @IsNumber()
  numeroVersao: number;

  @IsString()
  conteudo: string;

  @IsOptional()
  @IsString()
  nomeAutor?: string;

  @IsString()
  criadoPor: string;
}
