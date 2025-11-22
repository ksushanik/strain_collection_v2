import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadPhotoDto {
  @IsInt()
  @Type(() => Number)
  sampleId: number;
}
