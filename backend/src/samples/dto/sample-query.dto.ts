import { IsOptional, IsEnum, IsString, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class SampleQueryDto {
  @IsOptional()
  @IsEnum(['PLANT', 'ANIMAL', 'WATER', 'SOIL', 'OTHER'])
  sampleType?: 'PLANT' | 'ANIMAL' | 'WATER' | 'SOIL' | 'OTHER';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;
}
