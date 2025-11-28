import { Test } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  const prisma = {
    strain: { count: jest.fn(), findMany: jest.fn() },
    sample: { count: jest.fn() },
    storageCell: { count: jest.fn() },
    storageBox: { count: jest.fn() },
  } as unknown as PrismaService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AnalyticsService);
  });

  it('computes overview totals and recent additions', async () => {
    prisma.strain.count = jest.fn().mockResolvedValue(4);
    prisma.sample.count = jest.fn().mockResolvedValue(3);
    prisma.storageCell.count = jest
      .fn()
      .mockResolvedValueOnce(90) // total cells
      .mockResolvedValueOnce(30); // occupied
    prisma.storageBox.count = jest.fn().mockResolvedValue(2);
    prisma.strain.findMany = jest
      .fn()
      .mockResolvedValue([{ id: 1, identifier: 'S1' }]);

    const res = await service.overview();

    expect(res).toMatchObject({
      totalStrains: 4,
      totalSamples: 3,
      totalBoxes: 2,
      occupiedCells: 30,
      freeCells: 60,
    });
    expect(prisma.strain.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 9, orderBy: { createdAt: 'desc' } }),
    );
    expect(res.recentAdditions).toHaveLength(1);
  });
});
