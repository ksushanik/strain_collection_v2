import { IsOptional, IsString } from 'class-validator';

export class CreateMethodDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

