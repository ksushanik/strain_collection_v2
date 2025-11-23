import { Test } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MediaService', () => {
  let service: MediaService;
  const prisma = {
    media: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [MediaService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(MediaService);
  });

  it('returns paginated media with search and meta', async () => {
    prisma.media.findMany = jest
      .fn()
      .mockResolvedValue([{ id: 1, name: 'LB' }]);
    prisma.media.count = jest.fn().mockResolvedValue(3);

    const result = await service.findAll({ search: 'lb', page: 2, limit: 1 });

    expect(prisma.media.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: 'lb', mode: 'insensitive' } },
            { composition: { contains: 'lb', mode: 'insensitive' } },
          ],
        },
        skip: 1,
        take: 1,
        orderBy: { createdAt: 'desc' },
      }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({ total: 3, page: 2, limit: 1, totalPages: 3 });
  });
});
