import { ApiProperty } from '@nestjs/swagger';

export class TaxonomyResultDto {
  @ApiProperty({
    description: 'NCBI Taxonomy ID',
    example: '1386',
  })
  taxId: string;

  @ApiProperty({
    description: 'Scientific name of the organism',
    example: 'Bacillus subtilis',
  })
  name: string;

  @ApiProperty({
    description: 'Taxonomic rank',
    example: 'species',
  })
  rank: string;
}
