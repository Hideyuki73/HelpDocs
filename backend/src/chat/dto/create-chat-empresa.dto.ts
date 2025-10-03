import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateChatEmpresaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  empresaId: string;

  @IsString()
  @IsNotEmpty()
  criadoPor: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean = true;

  @IsOptional()
  @IsBoolean()
  publico?: boolean = true;
}
