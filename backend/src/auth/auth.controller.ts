import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LocalAuthGuard } from './local-auth.guard';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

import { RegisterUserDto } from './dto/register-user.dto';

@Controller('api/v1/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@example.com' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['email', 'password'],
    },
  })
  login(@Request() req: { user: Omit<User, 'password'> }) {
    return this.authService.login(req.user);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() createUserDto: RegisterUserDto) {
    const allowPublicRegistration =
      this.configService.get<string>('ALLOW_PUBLIC_REGISTRATION') === 'true';
    if (!allowPublicRegistration) {
      throw new ForbiddenException('Public registration is disabled');
    }

    return this.usersService.create({
      email: createUserDto.email,
      password: createUserDto.password,
      name: createUserDto.name,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Request() req: { user: Omit<User, 'password'> }) {
    return req.user;
  }
}
