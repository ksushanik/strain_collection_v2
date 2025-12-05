import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import session from 'express-session';
import { adminSessionOptions } from './admin/admin-session.config';
import express, { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const adminBundleDir = path.join(process.cwd(), '.adminjs');
  const adminBundlePath = path.join(adminBundleDir, 'bundle.js');
  const adminBundleAlias = path.join(adminBundleDir, 'components.bundle.js');
  const publicAssetsDir = path.join(process.cwd(), 'public');
  const isProd = process.env.NODE_ENV === 'production';
  const adminjsAssetsRoot = path.join(
    process.cwd(),
    'node_modules',
    'adminjs',
    'lib',
    'frontend',
    'assets',
    'scripts',
  );
  const designSystemBundlePath = path.join(
    process.cwd(),
    'node_modules',
    '@adminjs',
    'design-system',
    isProd ? 'bundle.production.js' : 'bundle.development.js',
  );
  const globalBundlePath = path.join(
    adminjsAssetsRoot,
    isProd ? 'global-bundle.production.js' : 'global-bundle.development.js',
  );
  const appBundlePath = path.join(
    adminjsAssetsRoot,
    isProd ? 'app-bundle.production.js' : 'app-bundle.development.js',
  );
  const server = express();

  const resolveComponentsBundle = (): string | undefined => {
    const candidates = [
      adminBundleAlias,
      adminBundlePath,
      path.join(publicAssetsDir, 'components.bundle.js'),
    ];
    return candidates.find((p) => fs.existsSync(p));
  };

  const serveComponentsBundle = (
    res: Response,
    next?: NextFunction,
  ): void => {
    const sourcePath = resolveComponentsBundle();
    if (!sourcePath) {
      console.error('components.bundle.js not found on disk');
      res.status(404).send('components.bundle.js not found');
      return;
    }

    try {
      const fileBuffer = fs.readFileSync(sourcePath);
      res
        .type('application/javascript')
        .setHeader('Cache-Control', 'public, max-age=0')
        .send(fileBuffer);
    } catch (err) {
      console.error('Failed to read components.bundle.js', err);
      if (next) {
        next(err);
      } else {
        res.status(500).send('components.bundle.js read error');
      }
    }
  };

  // Ensure alias and public copy of components bundle exist (useful in dev)
  try {
    if (fs.existsSync(adminBundlePath) && !fs.existsSync(adminBundleAlias)) {
      fs.copyFileSync(adminBundlePath, adminBundleAlias);
    }
    const publicBundle = path.join(publicAssetsDir, 'components.bundle.js');
    if (fs.existsSync(adminBundleAlias) && !fs.existsSync(publicBundle)) {
      fs.copyFileSync(adminBundleAlias, publicBundle);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('AdminJS bundle copy failed', err);
  }
  // Short-circuit for AdminJS bundle requests before Nest/AdminJS routers
  server.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.originalUrl.includes('components.bundle.js')) return next();
    serveComponentsBundle(res, next);
  });

  // Serve AdminJS bundled custom components (components.bundle.js -> .adminjs/bundle.js)
  server.get(
    '/admin/frontend/assets/components.bundle.js',
    (_req: Request, res: Response, next: NextFunction): void => {
      serveComponentsBundle(res, next);
    },
  );
  // Serve AdminJS core bundles explicitly (fixes local/dev path resolution)
  const serveStaticFile =
    (filePath: string, name: string) =>
    (_req: Request, res: Response, next: NextFunction): void => {
      if (!fs.existsSync(filePath)) return next();
      res
        .type('application/javascript')
        .setHeader('Cache-Control', 'public, max-age=0')
        .sendFile(filePath, (err) => {
          if (err) return next(err);
          // eslint-disable-next-line no-console
          console.log(`[admin assets] served ${name} from ${filePath}`);
        });
    };

  server.get(
    '/admin/frontend/assets/global.bundle.js',
    serveStaticFile(globalBundlePath, 'global.bundle.js'),
  );
  server.get(
    '/admin/frontend/assets/app.bundle.js',
    serveStaticFile(appBundlePath, 'app.bundle.js'),
  );
  server.get(
    '/admin/frontend/assets/design-system.bundle.js',
    serveStaticFile(designSystemBundlePath, 'design-system.bundle.js'),
  );
  // Fallback static serve (after explicit handlers so missing files can fall through)
  server.use(
    '/admin/frontend/assets',
    express.static(publicAssetsDir, { fallthrough: true }),
  );
  server.use(
    '/admin/frontend/assets',
    express.static(adminBundleDir, { fallthrough: true }),
  );

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  const expressApp = app.getHttpAdapter().getInstance();

  // Enable CORS for frontend on port 3000
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  app.use(session(adminSessionOptions));
  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'), {
      maxAge: '30d',
      fallthrough: true,
    }),
  );
  // Debug log for admin assets requests
  expressApp.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.originalUrl.includes('components.bundle.js')) {
      // eslint-disable-next-line no-console
      console.log('components.bundle.js request', req.originalUrl);
    }
    next();
  });
  // Serve AdminJS bundled custom components (components.bundle.js -> .adminjs/bundle.js)
  expressApp.get(
    '/admin/frontend/assets/components.bundle.js',
    (_req: Request, res: Response, next: NextFunction): void => {
      serveComponentsBundle(res, next);
    },
  );

  // Validation/transform
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        console.error('Validation errors:', JSON.stringify(errors, null, 2));
        return new BadRequestException(errors);
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Strain Collection API')
    .setDescription(
      'API documentation for microbiological strain collection system',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
