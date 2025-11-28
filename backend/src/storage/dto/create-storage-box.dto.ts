import { IsString, IsInt, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStorageBoxDto {
  @IsString()
  displayName: string;

  @IsInt()
  @Type(() => Number)
  @IsIn([9, 10])
  rows: number;

  @IsInt()
  @Type(() => Number)
  @IsIn([9, 10])
  cols: number;

  @IsOptional()
  @IsString()
  description?: string;
}
