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
  const server = express();
  // Short-circuit for AdminJS bundle requests before Nest/AdminJS routers
  server.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.originalUrl.includes('components.bundle.js')) return next();

    const candidates = [
      adminBundleAlias,
      adminBundlePath,
      path.join(publicAssetsDir, 'components.bundle.js'),
    ];
    const sourcePath = candidates.find((p) => fs.existsSync(p));

    if (!sourcePath) {
      // eslint-disable-next-line no-console
      console.error('components.bundle.js not found on disk');
      return res.status(404).send('components.bundle.js not found');
    }

    // eslint-disable-next-line no-console
    console.log('[pre-router] Serving components.bundle.js from', sourcePath);

    return res
      .type('application/javascript')
      .setHeader('Cache-Control', 'public, max-age=0')
      .sendFile(sourcePath);
  });

  // Serve AdminJS bundled custom components (components.bundle.js -> .adminjs/bundle.js)
  server.get(
    '/admin/frontend/assets/components.bundle.js',
    (_req: Request, res: Response): void => {
      const candidates = [
        adminBundleAlias,
        adminBundlePath,
        path.join(publicAssetsDir, 'components.bundle.js'),
      ];
      const sourcePath = candidates.find((p) => fs.existsSync(p));

      if (!sourcePath) {
        // eslint-disable-next-line no-console
        console.error('components.bundle.js not found on disk');
        res.status(404).send('components.bundle.js not found');
        return;
      }

      // eslint-disable-next-line no-console
      console.log('Serving components.bundle.js from', sourcePath);

      res
        .type('application/javascript')
        .setHeader('Cache-Control', 'public, max-age=0')
        .sendFile(sourcePath);
    },
  );
  server.use('/admin/frontend/assets', express.static(publicAssetsDir));
  server.use('/admin/frontend/assets', express.static(adminBundleDir));

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
    (req: Request, res: Response, next: NextFunction): void => {
      const sourcePath = fs.existsSync(adminBundleAlias)
        ? adminBundleAlias
        : fs.existsSync(adminBundlePath)
          ? adminBundlePath
          : null;
      if (!sourcePath) return next();

      try {
        res
          .type('application/javascript')
          .setHeader('Cache-Control', 'public, max-age=0')
          .send(fs.readFileSync(sourcePath));
      } catch (err) {
        console.error('AdminJS bundle read failed', err);
        return next();
      }
    },
  );
  expressApp.use('/admin/frontend/assets', express.static(publicAssetsDir));
  expressApp.use('/admin/frontend/assets', express.static(adminBundleDir));
  // Error handler to recover from AdminJS static 404 and serve our bundle
  expressApp.use(
    '/admin/frontend/assets/components.bundle.js',
    (
      err: any,
      _req: Request,
      res: Response,
      next: NextFunction,
    ): void => {
      if (!err) return next();

      const fallback =
        (fs.existsSync(adminBundleAlias) && adminBundleAlias) ||
        (fs.existsSync(adminBundlePath) && adminBundlePath) ||
        (fs.existsSync(path.join(publicAssetsDir, 'components.bundle.js')) &&
          path.join(publicAssetsDir, 'components.bundle.js'));

      if (fallback) {
        // eslint-disable-next-line no-console
        console.warn(
          'Recovered components.bundle.js via error handler from',
          fallback,
        );
        res
          .type('application/javascript')
          .setHeader('Cache-Control', 'public, max-age=0')
          .sendFile(fallback);
        return;
      }

      return next(err);
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
