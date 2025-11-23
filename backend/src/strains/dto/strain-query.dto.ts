import {
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

const toOptionalBool = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return undefined;
};

export class StrainQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sampleId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(toOptionalBool)
  seq?: boolean;

  @IsOptional()
  @IsEnum(['POSITIVE', 'NEGATIVE', 'VARIABLE'])
  gramStain?: 'POSITIVE' | 'NEGATIVE' | 'VARIABLE';

  @IsOptional()
  @IsBoolean()
  @Transform(toOptionalBool)
  phosphates?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(toOptionalBool)
  siderophores?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(toOptionalBool)
  pigmentSecretion?: boolean;

  @IsOptional()
  @IsString()
  sampleCode?: string;

  @IsOptional()
  @IsString()
  antibioticActivity?: string;

  @IsOptional()
  @IsString()
  genome?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(toOptionalBool)
  hasGenome?: boolean;

  @IsOptional()
  @IsString()
  taxonomy?: string;

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
