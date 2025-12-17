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
import { CaslModule } from './casl/casl.module';
import { AuditModule } from './audit/audit.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MediaModule } from './media/media.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
import { AdminModule } from './admin/admin.module';
import { MethodsModule } from './methods/methods.module';
import { SearchModule } from './search/search.module';

const includeAdmin = process.env.SKIP_ADMIN !== 'true';

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
    AnalyticsModule,
    MediaModule,
    MethodsModule,
    SearchModule,
    TaxonomyModule,
    ...(includeAdmin ? [AdminModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
