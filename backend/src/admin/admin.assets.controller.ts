import { Controller, Get, Res } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('admin/frontend/assets')
export class AdminAssetsController {
  @Get('components.bundle.js')
  serveComponentsBundle(@Res() res: ExpressResponse) {
    const adminBundleDir = path.join(process.cwd(), '.adminjs');
    const adminBundlePath = path.join(adminBundleDir, 'bundle.js');
    const aliasPath = path.join(adminBundleDir, 'components.bundle.js');

    // Create alias if needed (AdminJS produces bundle.js)
    if (fs.existsSync(adminBundlePath) && !fs.existsSync(aliasPath)) {
      try {
        fs.copyFileSync(adminBundlePath, aliasPath);
      } catch (err) {
        // If copy fails, still attempt to serve the original bundle
        // eslint-disable-next-line no-console
        console.error('AdminJS bundle copy failed', err);
      }
    }

    // Prefer original bundle.js; alias is just for static serving convenience
    res.sendFile(adminBundlePath, (err) => {
      if (err) {
        res.status(404).send('components.bundle.js not found');
      }
    });
  }
}
