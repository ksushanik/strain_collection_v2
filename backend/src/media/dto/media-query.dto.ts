import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class MediaQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;
}
