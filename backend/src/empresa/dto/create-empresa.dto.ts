import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  telefone: string;

  @IsString()
  @IsNotEmpty()
  endereco: string;
}
