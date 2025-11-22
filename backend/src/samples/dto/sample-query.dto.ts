import { IsOptional, IsEnum, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SampleQueryDto {
  @IsOptional()
  @IsEnum(['PLANT', 'ANIMAL', 'WATER', 'SOIL', 'OTHER'])
  sampleType?: 'PLANT' | 'ANIMAL' | 'WATER' | 'SOIL' | 'OTHER';

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
