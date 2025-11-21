import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SamplesController } from './samples.controller';
import { SamplesService } from './samples.service';
import { ImageKitService } from '../services/imagekit.service';

@Module({
    imports: [ConfigModule],
    controllers: [SamplesController],
    providers: [SamplesService, ImageKitService],
    exports: [SamplesService],
})
export class SamplesModule { }
