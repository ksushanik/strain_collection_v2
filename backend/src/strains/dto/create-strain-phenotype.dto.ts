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
  @IsNumber()
  methodId?: number;

  @IsOptional()
  conditions?: any; // JSON object
}
