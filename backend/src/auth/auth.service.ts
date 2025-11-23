import { Injectable } from '@nestjs/common';
import { User, Role } from '@prisma/client';
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
  ): Promise<Omit<User, 'password'> | null> {
    console.log('Validating user:', email);
    const user = await this.usersService.findOne(email);
    console.log('User found:', !!user);
    if (user && (await bcrypt.compare(pass, user.password))) {
      console.log('Password match');
      const { password: _password, ...result } = user;
      void _password;
      return result as Omit<User, 'password'>;
    }
    console.log('Invalid credentials');
    return null;
  }

  login(user: Omit<User, 'password'>) {
    const payload: { email: string; sub: number; role: Role } = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
