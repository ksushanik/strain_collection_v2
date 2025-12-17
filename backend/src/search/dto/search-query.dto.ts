import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsString()
  @MinLength(2)
  query!: string;

  @IsOptional()
  @IsIn(['preview', 'full'])
  mode?: 'preview' | 'full' = 'preview';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  perSection?: number;
}
