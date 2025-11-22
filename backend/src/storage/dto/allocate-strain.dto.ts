import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AllocateStrainDto {
  @IsInt()
  @Type(() => Number)
  cellId: number;

  @IsInt()
  @Type(() => Number)
  strainId: number;
}
