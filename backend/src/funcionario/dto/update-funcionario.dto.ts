import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateFuncionarioDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsString()
  senha?: string;
}
