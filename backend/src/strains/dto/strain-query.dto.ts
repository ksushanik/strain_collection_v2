import { IsOptional, IsInt, IsBoolean, IsEnum, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class StrainQueryDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    sampleId?: number;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    seq?: boolean;

    @IsOptional()
    @IsEnum(['POSITIVE', 'NEGATIVE', 'VARIABLE'])
    gramStain?: 'POSITIVE' | 'NEGATIVE' | 'VARIABLE';

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    phosphates?: boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    siderophores?: boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    pigmentSecretion?: boolean;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    page?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    limit?: number;
}
