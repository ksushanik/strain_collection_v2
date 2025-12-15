import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStrainDto } from './create-strain.dto';

export class UpdateStrainDto extends PartialType(CreateStrainDto) {
  @IsOptional()
  @IsEnum(['MASTER', 'WORKING', 'DISTRIBUTION'])
  stockType?: 'MASTER' | 'WORKING' | 'DISTRIBUTION';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  passageNumber?: number;
}
