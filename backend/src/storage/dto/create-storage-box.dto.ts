import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStorageBoxDto {
  @IsString()
  displayName: string;

  @IsEnum(['FRIDGE_MINUS_80', 'FRIDGE_MINUS_20', 'FRIDGE_PLUS_4', 'ROOM_TEMP'])
  storageType?:
    | 'FRIDGE_MINUS_80'
    | 'FRIDGE_MINUS_20'
    | 'FRIDGE_PLUS_4'
    | 'ROOM_TEMP';

  @IsInt()
  @Type(() => Number)
  rows: number;

  @IsInt()
  @Type(() => Number)
  cols: number;

  @IsOptional()
  @IsString()
  description?: string;
}
