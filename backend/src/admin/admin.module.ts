import { Module } from '@nestjs/common';
import { AdminModule as AdminJSModule } from '@adminjs/nestjs';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from '../users/users.module';
import { createAdminOptions } from './admin.options';

AdminJS.registerAdapter({ Database, Resource });

@Module({
  imports: [
    AdminJSModule.createAdminAsync({
      imports: [PrismaModule, AuthModule, UsersModule],
      inject: [PrismaService, AuthService],
      useFactory: async (prisma: PrismaService, authService: AuthService) => {
        const dmmf = (prisma as any)._baseDmmf;
        const adminOptions = createAdminOptions(prisma, dmmf);

        return {
          adminJsOptions: {
            ...adminOptions,
          },
          auth: {
            authenticate: async (email: string, password: string) => {
              console.log('AdminJS: Attempting authentication for', email);

              try {
                const user = await authService.validateUser(email, password);

                if (!user) {
                  console.log('AdminJS: Invalid credentials');
                  return null;
                }

                if (user.role !== 'ADMIN') {
                  console.log('AdminJS: User is not an admin', user.role);
                  return null;
                }

                console.log('AdminJS: Authentication successful');
                return { email: user.email, role: user.role };
              } catch (error) {
                console.error('AdminJS: Authentication error', error);
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
    }),
  ],
})
export class AdminModule {}
