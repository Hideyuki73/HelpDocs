import { IsString, IsOptional, IsArray, ArrayUnique } from 'class-validator';

export class UpdateEquipeDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  documentoId?: string;

  @IsOptional()
  @IsString()
  criadorId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  membros?: string[];
}
