import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<(Omit<User, 'password'> & { role?: { key?: string } }) | null> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password: _password, ...result } = user;
      void _password;
      return result as Omit<User, 'password'> & { role?: { key?: string } };
    }
    return null;
  }

  login(user: Omit<User, 'password'> & { role?: { key?: string } }) {
    const payload: { email: string; sub: number; role: string } = {
      email: user.email,
      sub: user.id,
      role: user.role?.key ?? 'USER',
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role?.key ?? 'USER',
      },
    };
  }
}
