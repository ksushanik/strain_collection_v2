import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
