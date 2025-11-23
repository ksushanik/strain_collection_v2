import {
  IsOptional,
  IsEnum,
  IsString,
  IsInt,
  IsDateString,
  IsNumber,
} from 'class-validator';
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
  @IsString()
  site?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latMax?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lngMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lngMax?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;
}
