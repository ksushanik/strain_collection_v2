import { Module } from '@nestjs/common';
import { SamplesController } from './samples.controller';
import { SamplesService } from './samples.service';
import { ImageKitModule } from '../services/imagekit.module';
import { CaslModule } from '../casl/casl.module';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [CaslModule, AuditModule, PrismaModule, ImageKitModule],
  controllers: [SamplesController],
  providers: [SamplesService],
  exports: [SamplesService],
})
export class SamplesModule {}
