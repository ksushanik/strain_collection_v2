import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { WgsStatus } from '@prisma/client';

export class CreateStrainGeneticsDto {
  @IsOptional()
  @IsEnum(WgsStatus)
  wgsStatus?: WgsStatus;

  @IsOptional()
  @IsDateString()
  sequencingDate?: string;

  @IsOptional()
  @IsString()
  assemblyAccession?: string;

  @IsOptional()
  @IsString()
  rawDataAccession?: string;

  @IsOptional()
  @IsString()
  fastaUrl?: string;

  @IsOptional()
  @IsString()
  marker16sAccession?: string;

  @IsOptional()
  @IsString()
  marker16sSequence?: string;
}