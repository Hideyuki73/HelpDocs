import { IsOptional, IsString } from 'class-validator';

export class UpdateChatDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsOptional()
  @IsString()
  criadoPor?: string;
}
