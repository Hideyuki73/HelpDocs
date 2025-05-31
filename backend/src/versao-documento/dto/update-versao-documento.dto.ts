import { IsOptional, IsString } from 'class-validator';

export class UpdateVersaoDocumentoDto {
  @IsOptional()
  @IsString()
  conteudo?: string;
}
