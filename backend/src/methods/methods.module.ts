import { Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MethodsController } from './methods.controller';
import { MethodsService } from './methods.service';

@Module({
  imports: [PrismaModule, CaslModule],
  controllers: [MethodsController],
  providers: [MethodsService],
  exports: [MethodsService],
})
export class MethodsModule {}

