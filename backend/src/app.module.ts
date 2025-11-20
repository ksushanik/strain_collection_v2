import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';
import { StrainsModule } from './strains/strains.module';

@Module({
  imports: [PrismaModule, SettingsModule, StrainsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
