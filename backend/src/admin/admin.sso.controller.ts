import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { Request, Response } from 'express';

@Controller('api/v1/admin-sso')
export class AdminSsoController {
  private static nonces = new Map<
    string,
    { email: string; role: string; exp: number }
  >();
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Post('sso')
  async sso(@Req() req: Request, @Res() res: Response) {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) throw new UnauthorizedException('Missing bearer token');
    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    if (payload?.role !== 'ADMIN') throw new UnauthorizedException('Not admin');
    const user = await this.prisma.user.findUnique({
      where: { email: payload?.email },
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
  ssoStart(@Req() req: Request, @Res() res: Response) {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) throw new UnauthorizedException('Missing bearer token');
    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    if (payload?.role !== 'ADMIN') throw new UnauthorizedException('Not admin');
    const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
    AdminSsoController.nonces.set(nonce, {
      email: payload.email,
      role: payload.role,
      exp: Date.now() + 60 * 1000,
    });
    res.status(200).json({ nonce });
  }

  @Get('sso/complete')
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
