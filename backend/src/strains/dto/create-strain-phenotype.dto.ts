import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateStrainPhenotypeDto {
  @IsOptional()
  @IsInt()
  traitDefinitionId?: number;

  @IsOptional()
  @IsString()
  traitName?: string;

  @IsString()
  result: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsInt()
  methodId?: number;

  @IsOptional()
  conditions?: any; // JSON object
}
