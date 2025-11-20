import { Module } from '@nestjs/common';
import { StrainsController } from './strains.controller';
import { StrainsService } from './strains.service';

@Module({
    controllers: [StrainsController],
    providers: [StrainsService],
    exports: [StrainsService],
})
export class StrainsModule { }
