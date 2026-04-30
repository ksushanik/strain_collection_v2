import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  } as unknown as AuthService;

  const usersService = {
    create: jest.fn(),
  } as unknown as UsersService;
  const jwtService = {} as JwtService;
  const configService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('rejects public registration when disabled', async () => {
    (configService.get as jest.Mock).mockReturnValueOnce('false');

    await expect(
      controller.register({
        email: 'user@example.com',
        password: 'password123',
        name: 'User',
      }),
    ).rejects.toThrow('Public registration is disabled');
  });

  it('creates user when public registration is enabled', async () => {
    (configService.get as jest.Mock).mockReturnValueOnce('true');
    (usersService.create as jest.Mock).mockResolvedValueOnce({
      email: 'user@example.com',
    });

    const result = await controller.register({
      email: 'user@example.com',
      password: 'password123',
      name: 'User',
    });

    expect(usersService.create).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
      name: 'User',
    });
    expect(result).toEqual({ email: 'user@example.com' });
  });
});
