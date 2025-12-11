import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';

@Controller('admin/frontend/assets')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class AdminAssetsController {
  @Get('components.bundle.js')
  @CheckPolicies((ability) => ability.can('manage', 'all'))
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
      console.error('AdminJS bundle read failed', err);
      res.status(404).send('components.bundle.js not found');
    }
  }
}
