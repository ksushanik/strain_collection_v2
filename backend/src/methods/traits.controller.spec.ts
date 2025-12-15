import { Test, TestingModule } from '@nestjs/testing';
import { TraitsController } from './traits.controller';
import { TraitsService } from './traits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';

describe('TraitsController', () => {
  let controller: TraitsController;
  let service: TraitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TraitsController],
      providers: [
        {
          provide: TraitsService,
          useValue: {
            getDictionary: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TraitsController>(TraitsController);
    service = module.get<TraitsService>(TraitsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of traits', async () => {
      const result = [{ id: 1, name: 'Gram Stain' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result as any);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('getDictionary', () => {
    it('should return dictionary', async () => {
        const result = [{ id: 1, name: 'Gram Stain' }];
        jest.spyOn(service, 'getDictionary').mockResolvedValue(result as any);
        expect(await controller.getDictionary()).toBe(result);
    });
  });
});
