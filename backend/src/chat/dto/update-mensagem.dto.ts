import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateMensagemDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  conteudo?: string;
}
