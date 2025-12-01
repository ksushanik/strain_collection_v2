import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateStorageBoxDto } from './create-storage-box.dto';

export class UpdateStorageBoxDto extends PartialType(
  OmitType(CreateStorageBoxDto, ['rows', 'cols'] as const),
) {}
