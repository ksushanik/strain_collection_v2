import { IsString, IsOptional } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  composition?: string;
}
