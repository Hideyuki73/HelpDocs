import { IsString } from 'class-validator';

export class CreateIaHelperDto {
  @IsString()
  pergunta: string;

  @IsString()
  resposta: string;

  @IsString()
  criadoPor: string;
}
