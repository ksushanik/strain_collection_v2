import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateStrainPhenotypeDto {
  @IsOptional()
  @IsNumber()
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
  conditions?: any; // JSON object
}
