import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SamplesController } from './samples.controller';
import { SamplesService } from './samples.service';
import { ImageKitService } from '../services/imagekit.service';
import { CaslModule } from '../casl/casl.module';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, CaslModule, AuditModule, PrismaModule],
  controllers: [SamplesController],
  providers: [SamplesService, ImageKitService],
  exports: [SamplesService],
})
export class SamplesModule {}
