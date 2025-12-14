import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class MethodQueryDto {
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

