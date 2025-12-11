import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { User } from '@prisma/client';
import { Public } from '../decorators/public.decorator';

@Controller('api/v1/admin-sso')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class AdminSsoController {
  private static nonces = new Map<
    string,
    { email: string; role: string; exp: number }
  >();
  constructor(private prisma: PrismaService) {}

  @Post('sso')
  @CheckPolicies((ability) => ability.can('manage', 'all'))
  async sso(@Req() req: Request, @Res() res: Response) {
    const authUser = req.user as Partial<User> & { role?: { key?: string } | string };
    const roleKey =
      (typeof authUser.role === 'object' && authUser.role?.key) ||
      (typeof authUser.role === 'string' ? authUser.role : null);
    if (roleKey !== 'ADMIN') throw new UnauthorizedException('Not admin');
    const user = await this.prisma.user.findUnique({
      where: { email: authUser.email },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    const anyReq = req as any;
    if (!anyReq.session)
      throw new UnauthorizedException('Session not available');
    anyReq.session.adminUser = {
      email: user.email,
      role: user.role?.key ?? 'USER',
    };
    res.status(200).json({ ok: true });
  }

  @Post('sso/start')
  @CheckPolicies((ability) => ability.can('manage', 'all'))
  ssoStart(@Req() req: Request, @Res() res: Response) {
    const user = req.user as Partial<User> & { role?: { key?: string } | string };
    const roleKey =
      (typeof user.role === 'object' && user.role?.key) ||
      (typeof user.role === 'string' ? user.role : null);
    if (roleKey !== 'ADMIN') throw new UnauthorizedException('Not admin');
    const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
    AdminSsoController.nonces.set(nonce, {
      email: user.email || '',
      role: roleKey,
      exp: Date.now() + 60 * 1000,
    });
    res.status(200).json({ nonce });
  }

  @Get('sso/complete')
  @CheckPolicies((ability) => ability.can('manage', 'all'))
  @Public()
  async ssoComplete(@Req() req: Request, @Res() res: Response) {
    const nonce = (req.query['nonce'] as string) || '';
    const record = AdminSsoController.nonces.get(nonce);
    if (!record || record.exp < Date.now())
      throw new UnauthorizedException('Nonce invalid');
    AdminSsoController.nonces.delete(nonce);
    const user = await this.prisma.user.findUnique({
      where: { email: record.email },
      include: { role: true },
    });
    if (!user || (user.role?.key ?? 'USER') !== 'ADMIN')
      throw new UnauthorizedException('User invalid');
    const anyReq = req as any;
    if (!anyReq.session)
      throw new UnauthorizedException('Session not available');
    anyReq.session.adminUser = {
      email: user.email,
      role: user.role?.key ?? 'USER',
    };
    res.redirect('/admin');
  }
}
