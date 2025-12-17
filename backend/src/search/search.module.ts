import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CaslModule } from '../casl/casl.module';
import { SettingsModule } from '../settings/settings.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [PrismaModule, CaslModule, SettingsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

