import { IsEnum, IsOptional } from 'class-validator';

export class StorageBoxQueryDto {
  @IsOptional()
  @IsEnum(['createdAt', 'displayName'])
  sortBy?: 'createdAt' | 'displayName';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

