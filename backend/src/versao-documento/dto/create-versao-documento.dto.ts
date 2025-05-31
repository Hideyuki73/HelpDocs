import { IsString, IsNumber } from 'class-validator';

export class CreateVersaoDocumentoDto {
  @IsString()
  documentoId: string;

  @IsNumber()
  numeroVersao: number;

  @IsString()
  conteudo: string;

  @IsString()
  criadoPor: string;
}
