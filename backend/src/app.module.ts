import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';
import { StrainsModule } from './strains/strains.module';
import { SamplesModule } from './samples/samples.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
// import { AdminModule } from './admin/admin.module'; // Временно отключено из-за несовместимости AdminJS v7 с CommonJS
import { CaslModule } from './casl/casl.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    SettingsModule,
    StrainsModule,
    SamplesModule,
    StorageModule,
    UsersModule,
    AuthModule,
    CaslModule,
    AuditModule,
    // AdminModule, // Временно отключено
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
