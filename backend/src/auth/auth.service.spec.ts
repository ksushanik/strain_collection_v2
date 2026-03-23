import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findOne: jest.fn(),
  } as unknown as UsersService;
  const jwtService = {
    sign: jest.fn().mockReturnValue('token'),
  } as unknown as JwtService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        CaslAbilityFactory,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
