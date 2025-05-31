import { IsOptional, IsString } from 'class-validator';

export class UpdateMensagemDto {
  @IsOptional()
  @IsString()
  conteudo?: string;
}
