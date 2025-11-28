import { Module } from '@nestjs/common';
import { StrainsController } from './strains.controller';
import { StrainsService } from './strains.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CaslModule } from '../casl/casl.module';
import { AuditModule } from '../audit/audit.module';
import { ImageKitService } from '../services/imagekit.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, PrismaModule, CaslModule, AuditModule],
  controllers: [StrainsController],
  providers: [StrainsService, ImageKitService],
  exports: [StrainsService],
})
export class StrainsModule {}
