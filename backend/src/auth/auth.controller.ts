import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import { ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './local-auth.guard';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

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

  @Post('register')
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() createUserDto: RegisterUserDto) {
    // Strictly sanitize input by pulling only known fields from the DTO
    // This prevents privilege escalation via injected 'role' property
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
