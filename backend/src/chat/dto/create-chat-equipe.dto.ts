import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateChatEquipeDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  equipeId: string;

  @IsString()
  @IsNotEmpty()
  criadoPor: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean = true;
}
