import { Module } from '@nestjs/common';
import { StrainsController } from './strains.controller';
import { StrainsService } from './strains.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CaslModule } from '../casl/casl.module';
import { AuditModule } from '../audit/audit.module';
import { ImageKitModule } from '../services/imagekit.module';

@Module({
  imports: [PrismaModule, CaslModule, AuditModule, ImageKitModule],
  controllers: [StrainsController],
  providers: [StrainsService],
  exports: [StrainsService],
})
export class StrainsModule {}
