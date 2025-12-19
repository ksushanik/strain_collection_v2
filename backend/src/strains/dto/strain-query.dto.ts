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
  @IsEnum(['RHIZOSPHERE', 'ENDOSPHERE', 'PHYLLOSPHERE', 'SOIL', 'OTHER'])
  isolationRegion?:
    | 'RHIZOSPHERE'
    | 'ENDOSPHERE'
    | 'PHYLLOSPHERE'
    | 'SOIL'
    | 'OTHER';

  @IsOptional()
  @IsString()
  sampleCode?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(toOptionalBool)
  hasGenome?: boolean;

  @IsOptional()
  @IsString()
  taxonomy?: string;

  @IsOptional()
  @IsEnum(['positive', 'negative'])
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  gramStain?: 'positive' | 'negative';

  @IsOptional()
  @IsBoolean()
  @Transform(toOptionalBool)
  amylase?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(toOptionalBool)
  phosphateSolubilization?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(toOptionalBool)
  siderophoreProduction?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(toOptionalBool)
  pigmentSecretion?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['createdAt', 'identifier', 'sampleCode', 'taxonomy16s', 'ncbiScientificName'])
  sortBy?:
    | 'createdAt'
    | 'identifier'
    | 'sampleCode'
    | 'taxonomy16s'
    | 'ncbiScientificName';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;
}
