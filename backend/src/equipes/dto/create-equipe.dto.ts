import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayUnique,
} from 'class-validator';

export class CreateEquipeDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  documentoId: string;

  @IsString()
  @IsNotEmpty()
  criadorId: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  membros?: string[];
}
