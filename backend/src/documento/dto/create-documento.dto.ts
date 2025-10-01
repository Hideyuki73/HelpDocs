import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ChecklistItemDto } from './checklist-item.dto';
import { Type } from 'class-transformer';

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
  equipeId: string;

  @IsString()
  @IsNotEmpty()
  criadoPor: string;

  @IsOptional()
  @IsEnum(['rascunho', 'publicado', 'arquivado'])
  status?: 'rascunho' | 'publicado' | 'arquivado' = 'rascunho';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: ChecklistItemDto[];
}
