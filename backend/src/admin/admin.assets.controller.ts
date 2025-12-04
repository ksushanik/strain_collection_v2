import { Controller, Get, Res } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('admin/frontend/assets')
export class AdminAssetsController {
  @Get('components.bundle.js')
  serveComponentsBundle(@Res() res: ExpressResponse) {
    const adminBundleDir = path.join(process.cwd(), '.adminjs');
    const bundlePath = path.join(adminBundleDir, 'bundle.js');
    const aliasPath = path.join(adminBundleDir, 'components.bundle.js');
    const sourcePath = fs.existsSync(bundlePath)
      ? bundlePath
      : fs.existsSync(aliasPath)
        ? aliasPath
        : null;

    if (!sourcePath) {
      res.status(404).send('components.bundle.js not found');
      return;
    }

    // Best-effort alias copy
    if (sourcePath === bundlePath && !fs.existsSync(aliasPath)) {
      try {
        fs.copyFileSync(bundlePath, aliasPath);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('AdminJS bundle copy failed', err);
      }
    }

    try {
      const contents = fs.readFileSync(sourcePath);
      res
        .setHeader('Content-Type', 'application/javascript')
        .setHeader('Cache-Control', 'public, max-age=0')
        .send(contents);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('AdminJS bundle read failed', err);
      res.status(404).send('components.bundle.js not found');
    }
  }
}
