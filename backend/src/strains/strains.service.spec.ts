import { Test } from '@nestjs/testing';
import { StrainsService } from './strains.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('StrainsService', () => {
  let service: StrainsService;
  const prisma = {
    strain: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    sample: {},
    media: {},
    strainMedia: {},
    storage: {},
    samplePhoto: {},
  } as unknown as PrismaService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [StrainsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(StrainsService);
  });

  it('returns paginated list with default limit/page', async () => {
    prisma.strain.findMany = jest.fn().mockResolvedValue([{ id: 1 }]);
    prisma.strain.count = jest.fn().mockResolvedValue(1);

    const res = await service.findAll({});

    expect(prisma.strain.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 50,
        orderBy: { createdAt: 'desc' },
      }),
    );
    expect(res.meta).toEqual({ total: 1, page: 1, limit: 50, totalPages: 1 });
  });

  it('applies hasGenome filter', async () => {
    prisma.strain.findMany = jest.fn().mockResolvedValue([]);
    prisma.strain.count = jest.fn().mockResolvedValue(0);

    await service.findAll({ hasGenome: true, page: 1, limit: 10 });
    expect(prisma.strain.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ genome: { not: null } }),
        skip: 0,
        take: 10,
      }),
    );
  });

  it('throws on remove unknown strain', async () => {
    prisma.strain.findUnique = jest.fn().mockResolvedValue(null);
    await expect(service.remove(123)).rejects.toBeInstanceOf(NotFoundException);
  });
});
