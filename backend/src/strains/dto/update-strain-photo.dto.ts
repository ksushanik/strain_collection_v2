import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStrainPhotoDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
