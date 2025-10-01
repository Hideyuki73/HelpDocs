import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChecklistItemDto } from './checklist-item.dto';

export class UpdateChecklistDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist: ChecklistItemDto[];
}
