import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStrainDto {
  @IsString()
  identifier: string;

  @IsInt()
  @Type(() => Number)
  sampleId: number;

  @IsOptional()
  @IsString()
  taxonomy16s?: string; // e.g. "Bacillus subtilis"

  @IsOptional()
  @IsString()
  otherTaxonomy?: string; // Biochemical, morphological, etc.

  @IsOptional()
  @IsString()
  indexerInitials?: string;

  @IsOptional()
  @IsString()
  collectionRcam?: string;

  @IsBoolean()
  @Type(() => Boolean)
  seq: boolean;

  @IsOptional()
  @IsString()
  biochemistry?: string;

  @IsOptional()
  @IsString()
  genome?: string;

  @IsOptional()
  @IsString()
  antibioticActivity?: string;

  @IsOptional()
  @IsEnum(['POSITIVE', 'NEGATIVE', 'VARIABLE'])
  gramStain?: 'POSITIVE' | 'NEGATIVE' | 'VARIABLE';

  @IsBoolean()
  @Type(() => Boolean)
  phosphates: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  siderophores: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  pigmentSecretion: boolean;

  @IsOptional()
  @IsEnum(['POSITIVE', 'NEGATIVE'])
  amylase?: 'POSITIVE' | 'NEGATIVE';

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
  iuk?: string;

  @IsOptional()
  @IsString()
  features?: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
