import { IsString, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSampleDto {
    @IsString()
    code: string;

    @IsEnum(['PLANT', 'ANIMAL', 'WATER', 'SOIL', 'OTHER'])
    sampleType: 'PLANT' | 'ANIMAL' | 'WATER' | 'SOIL' | 'OTHER';

    @IsString()
    siteName: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lat?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lng?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsDateString()
    collectedAt: string;
}
