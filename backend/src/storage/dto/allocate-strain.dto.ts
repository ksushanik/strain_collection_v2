import {
  IsInt,
  IsString,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class AllocateStrainDto {
  @IsInt()
  @Type(() => Number)
  boxId: number;

  @IsString()
  cellCode: string;

  @IsInt()
  @Type(() => Number)
  strainId: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPrimary?: boolean;
}

export class BulkAllocateStrainDto {
  @IsInt()
  @Type(() => Number)
  boxId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllocateStrainDto)
  allocations: AllocateStrainDto[];
}
