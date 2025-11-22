import { PartialType } from '@nestjs/mapped-types';
import { CreateStrainDto } from './create-strain.dto';

export class UpdateStrainDto extends PartialType(CreateStrainDto) {}
