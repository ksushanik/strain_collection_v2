import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyResultDto } from './dto/taxonomy-result.dto';

@Controller('api/v1/taxonomy')
@ApiTags('Taxonomy')
export class TaxonomyController {
    constructor(private readonly taxonomyService: TaxonomyService) { }

    @Get('search')
    @ApiOperation({ summary: 'Search NCBI Taxonomy database for autocomplete' })
    @ApiQuery({
        name: 'q',
        description: 'Search query (will be wildcarded automatically)',
        example: 'Bacillus',
    })
    async search(@Query('q') query: string): Promise<TaxonomyResultDto[]> {
        return this.taxonomyService.searchTaxonomy(query);
    }
}
