import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';

export class UpdateDocumentoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  conteudo?: string;

  @IsOptional()
  @IsString()
  arquivoUrl?: string;

  @IsOptional()
  @IsString()
  nomeArquivo?: string;

  @IsOptional()
  @IsNumber()
  tamanhoArquivo?: number;

  @IsString()
  @IsOptional()
  empresaId?: string;

  @IsString()
  @IsOptional()
  equipeId?: string;

  @IsString()
  @IsOptional()
  criadoPor?: string;

  @IsOptional()
  @IsEnum(['rascunho', 'publicado', 'arquivado'])
  status?: 'rascunho' | 'publicado' | 'arquivado';
}
