import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import session from 'express-session';
import { adminSessionOptions } from './admin/admin-session.config';
import * as express from 'express';
import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  // Serve AdminJS bundled custom components (components.bundle.js -> .adminjs/bundle.js)
  const adminBundleDir = path.join(process.cwd(), '.adminjs');
  const adminBundlePath = path.join(adminBundleDir, 'bundle.js');
  const ensureBundleAlias = () => {
    const aliasPath = path.join(adminBundleDir, 'components.bundle.js');
    if (fs.existsSync(adminBundlePath) && !fs.existsSync(aliasPath)) {
      try {
        fs.copyFileSync(adminBundlePath, aliasPath);
      } catch (err) {
        console.error('AdminJS bundle copy failed', err);
      }
    }
  };
  app.use(
    '/admin/frontend/assets',
    (req: Request, res: Response, next: express.NextFunction) => {
      // On demand alias creation and direct send for components.bundle.js
      if (req.path === '/components.bundle.js') {
        ensureBundleAlias();
        return res.sendFile(adminBundlePath, (err) => {
          if (err) {
            return next();
          }
        });
      }
      next();
    },
    express.static(adminBundleDir),
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
