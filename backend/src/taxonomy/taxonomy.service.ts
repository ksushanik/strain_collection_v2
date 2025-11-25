import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { TaxonomyResultDto } from './dto/taxonomy-result.dto';

@Injectable()
export class TaxonomyService {
    private readonly logger = new Logger(TaxonomyService.name);
    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>(
            'NCBI_API_URL',
            'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
        );
        this.apiKey = this.configService.get<string>('NCBI_API_KEY') || '';
    }

    /**
     * Search NCBI Taxonomy database using ESearch -> ESummary chain
     * @param query - Search term (wildcard * will be added automatically)
     * @returns Array of taxonomy results
     */
    async searchTaxonomy(query: string): Promise<TaxonomyResultDto[]> {
        if (!query || query.trim().length === 0) {
            return [];
        }

        try {
            // Step 1: ESearch - Get IDs
            const idList = await this.performESearch(query);

            if (idList.length === 0) {
                return [];
            }

            // Step 2: ESummary - Get details for IDs
            const results = await this.performESummary(idList);

            return results;
        } catch (error) {
            this.logger.error(`Error searching taxonomy: ${error.message}`, error.stack);
            return [];
        }
    }

    /**
     * Step 1: Perform ESearch to get taxonomy IDs
     */
    private async performESearch(query: string): Promise<string[]> {
        const params: any = {
            db: 'taxonomy',
            term: `${query}*`, // Add wildcard for autocomplete
            retmode: 'json',
        };

        if (this.apiKey) {
            params.api_key = this.apiKey;
        }

        const url = `${this.baseUrl}/esearch.fcgi`;

        try {
            const response = await firstValueFrom(
                this.httpService.get<any>(url, { params }),
            );

            const idList = response.data?.esearchresult?.idlist || [];
            this.logger.debug(`ESearch found ${idList.length} IDs for query: ${query}`);

            return idList;
        } catch (error) {
            this.logger.error(`ESearch error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Step 2: Perform ESummary to get taxonomy details
     */
    private async performESummary(idList: string[]): Promise<TaxonomyResultDto[]> {
        const params: any = {
            db: 'taxonomy',
            id: idList.join(','),
            retmode: 'json',
        };

        if (this.apiKey) {
            params.api_key = this.apiKey;
        }

        const url = `${this.baseUrl}/esummary.fcgi`;

        try {
            const response = await firstValueFrom(
                this.httpService.get<any>(url, { params }),
            );

            const result = response.data?.result;

            if (!result) {
                return [];
            }

            // Convert object of IDs to array
            const taxonomyResults: TaxonomyResultDto[] = [];

            for (const id of idList) {
                const item = result[id];

                if (item && item.scientificname) {
                    taxonomyResults.push({
                        taxId: String(item.taxid || id),
                        name: item.scientificname,
                        rank: item.rank || 'unknown',
                    });
                }
            }

            this.logger.debug(`ESummary returned ${taxonomyResults.length} results`);

            return taxonomyResults;
        } catch (error) {
            this.logger.error(`ESummary error: ${error.message}`);
            throw error;
        }
    }
}
