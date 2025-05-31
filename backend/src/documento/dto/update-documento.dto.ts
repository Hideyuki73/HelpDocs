import { IsOptional, IsString } from 'class-validator';

export class UpdateDocumentoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsString()
  @IsOptional()
  empresaId?: string;

  @IsString()
  @IsOptional()
  criadoPor?: string;
}
