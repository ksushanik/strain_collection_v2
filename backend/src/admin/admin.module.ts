import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from '../users/users.module';
import { createAdminOptions } from './admin.options';

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
        { default: AdminJS },
      ]) => {
        AdminJS.registerAdapter({ Database, Resource });

        return AdminModule.createAdminAsync({
          imports: [PrismaModule, AuthModule, UsersModule],
          inject: [PrismaService, AuthService],
          useFactory: (prisma: PrismaService, authService: AuthService) => {
            const adminOptions = createAdminOptions(prisma, (name: string) =>
              getModelByName(name),
            );

            return {
              adminJsOptions: {
                ...adminOptions,
              },
              auth: {
                authenticate: async (email: string, password: string) => {
                  try {
                    const user = await authService.validateUser(
                      email,
                      password,
                    );
                    if (!user || user.role !== 'ADMIN') return null;
                    return { email: user.email, role: user.role };
                  } catch {
                    return null;
                  }
                },
                cookieName: 'adminjs',
                cookiePassword:
                  process.env.ADMIN_COOKIE_SECRET ||
                  'admin_secret_change_in_production',
              },
              sessionOptions: {
                resave: false,
                saveUninitialized: false,
                secret:
                  process.env.ADMIN_SESSION_SECRET ||
                  'session_secret_change_in_production',
              },
            };
          },
        });
      },
    ),
  ],
})
export class AdminModule {}
