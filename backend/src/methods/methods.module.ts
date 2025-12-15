import { Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MethodsController } from './methods.controller';
import { MethodsService } from './methods.service';
import { TraitsController } from './traits.controller';
import { TraitsService } from './traits.service';

@Module({
  imports: [PrismaModule, CaslModule],
  controllers: [TraitsController, MethodsController],
  providers: [MethodsService, TraitsService],
  exports: [MethodsService, TraitsService],
})
export class MethodsModule {}

