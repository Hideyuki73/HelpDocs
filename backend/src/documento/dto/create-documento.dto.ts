import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateDocumentoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsOptional()
  @IsString()
  conteudo?: string;

  @IsEnum(['criado', 'upload'])
  tipo: 'criado' | 'upload';

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
  @IsNotEmpty()
  empresaId: string;

  @IsString()
  @IsNotEmpty()
  equipeId: string;

  @IsString()
  @IsNotEmpty()
  criadoPor: string;

  @IsOptional()
  @IsEnum(['rascunho', 'publicado', 'arquivado'])
  status?: 'rascunho' | 'publicado' | 'arquivado' = 'rascunho';
}
