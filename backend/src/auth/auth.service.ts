import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  CaslAbilityFactory,
  PermissionMap,
} from '../casl/casl-ability.factory';

type AuthUser = Omit<User, 'password'> & {
  role?: { key?: string; permissions?: PermissionMap | null } | string;
  group?: { permissions?: PermissionMap | null } | null;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<AuthUser | null> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password: _password, ...result } = user;
      void _password;
      return result as AuthUser;
    }
    return null;
  }

  login(user: AuthUser) {
    const roleKey =
      (typeof user.role === 'object' && user.role?.key) ||
      (typeof user.role === 'string' ? user.role : null);
    const payload: { email: string; sub: number; role: string } = {
      email: user.email,
      sub: user.id,
      role: roleKey ?? 'USER',
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: roleKey ?? 'USER',
        permissions: this.caslAbilityFactory.getPermissionsForUser(user),
      },
    };
  }
}
