import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyController } from './taxonomy.controller';

@Module({
    imports: [HttpModule],
    controllers: [TaxonomyController],
    providers: [TaxonomyService],
    exports: [TaxonomyService],
})
export class TaxonomyModule { }
