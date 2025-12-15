import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BiosafetyLevel, StrainStatus } from '@prisma/client';
import { CreateStrainPhenotypeDto } from './create-strain-phenotype.dto';
import { CreateStrainGeneticsDto } from './create-strain-genetics.dto';

export class CreateStrainDto {
  @IsString()
  identifier: string;

  @IsInt()
  @Type(() => Number)
  sampleId: number;

  // --- Refactoring v2 Fields ---
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  ncbiTaxonomyId?: number;

  @IsOptional()
  @IsString()
  ncbiScientificName?: string;

  @IsOptional()
  @IsEnum(BiosafetyLevel)
  biosafetyLevel?: BiosafetyLevel;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  isolatorId?: number;

  @IsOptional()
  @IsDateString()
  isolationDate?: string;

  @IsOptional()
  @IsEnum(StrainStatus)
  status?: StrainStatus;

  @IsOptional()
  @IsEnum(['MASTER', 'WORKING', 'DISTRIBUTION'])
  stockType?: 'MASTER' | 'WORKING' | 'DISTRIBUTION';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  passageNumber?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateStrainPhenotypeDto)
  phenotypes?: CreateStrainPhenotypeDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateStrainGeneticsDto)
  genetics?: CreateStrainGeneticsDto;

  // --- Legacy Fields ---
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
  features?: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
