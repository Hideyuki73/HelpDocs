import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class ChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsBoolean()
  concluido: boolean;
}
