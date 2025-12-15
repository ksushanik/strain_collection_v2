import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export enum TraitDataType {
  BOOLEAN = 'BOOLEAN',
  NUMERIC = 'NUMERIC',
  CATEGORICAL = 'CATEGORICAL',
  TEXT = 'TEXT',
}

export class CreateTraitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(TraitDataType)
  dataType: TraitDataType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsString()
  units?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
