import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from '../users/users.module';
import { SettingsModule } from '../settings/settings.module';
import { SettingsService } from '../settings/settings.service';
import { AuditModule } from '../audit/audit.module';
import { AuditLogService } from '../audit/audit-log.service';
import { createAdminOptions } from './admin.options';
import { AdminSsoController } from './admin.sso.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { adminSessionOptions } from './admin-session.config';

@Module({
  imports: [
    Promise.all([
      import('@adminjs/nestjs'),
      import('@adminjs/prisma'),
      import('adminjs'),
    ]).then(
      ([
        { AdminModule },
        { Database, Resource, getModelByName },
        { default: AdminJS, ComponentLoader },
      ]) => {
        AdminJS.registerAdapter({ Database, Resource });

        const componentLoader = new ComponentLoader();
        const dashboard = componentLoader.add(
          'Dashboard',
          './components/dashboard',
        );
        const jsonShow = componentLoader.add(
          'JsonShow',
          './components/json-show',
        );
        const restoreComponent = componentLoader.add(
          'RestoreBackup',
          './components/restore-backup',
        );

        return AdminModule.createAdminAsync({
          imports: [
            PrismaModule,
            AuthModule,
            UsersModule,
            SettingsModule,
            AuditModule,
            ConfigModule,
            JwtModule.registerAsync({
              imports: [ConfigModule],
              useFactory: (config: ConfigService) => ({
                secret:
                  config.get<string>('JWT_SECRET') ||
                  'dev_secret_key_do_not_use_in_prod',
                signOptions: { expiresIn: '7d' },
              }),
              inject: [ConfigService],
            }),
          ],
          inject: [
            PrismaService,
            AuthService,
            SettingsService,
            AuditLogService,
          ],
          useFactory: (
            prisma: PrismaService,
            authService: AuthService,
            settingsService: SettingsService,
            auditLogService: AuditLogService,
          ) => {
            const adminOptions = createAdminOptions(
              prisma,
              (name: string) => getModelByName(name),
              settingsService,
              auditLogService,
              null,
              jsonShow,
              restoreComponent,
            );

            return {
              adminJsOptions: {
                ...adminOptions,
                componentLoader,
                dashboard: {
                  component: dashboard,
                },
              },
              auth: {
                cookieName: adminSessionOptions.name ?? 'adminjs',
                cookiePassword: (adminSessionOptions.secret as string) ?? '',
                authenticate: async (email: string, password: string) => {
                  try {
                    const user = await authService.validateUser(
                      email,
                      password,
                    );
                    const roleKey =
                      (user as any)?.role?.key ??
                      (typeof (user as any)?.role === 'string'
                        ? (user as any).role
                        : 'USER');
                    if (!user || roleKey !== 'ADMIN') return null;
                    return { email: user.email, role: roleKey };
                  } catch {
                    return null;
                  }
                },
              },
              sessionOptions: {
                ...adminSessionOptions,
              },
            };
          },
        });
      },
    ),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_SECRET') ||
          'dev_secret_key_do_not_use_in_prod',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminSsoController],
})
export class AdminModule {}
