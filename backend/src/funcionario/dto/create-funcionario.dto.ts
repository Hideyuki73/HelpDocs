import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFuncionarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsOptional()
  cargo: string;

  @IsOptional()
  empresaId?: string;
}
