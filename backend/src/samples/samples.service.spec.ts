import { Test } from '@nestjs/testing';
import { SamplesService } from './samples.service';
import { PrismaService } from '../prisma/prisma.service';
import { ImageKitService } from '../services/imagekit.service';

describe('SamplesService', () => {
  let service: SamplesService;

  const prisma = {
    $transaction: jest.fn(),
  } as unknown as PrismaService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        SamplesService,
        { provide: PrismaService, useValue: prisma },
        { provide: ImageKitService, useValue: {} },
      ],
    }).compile();

    service = module.get(SamplesService);
  });

  it('adds numeric suffix when creating a duplicate sample display code', async () => {
    const base = 'other_До-обработки,-БЦБК';
    const tx = {
      $executeRaw: jest.fn().mockResolvedValue(undefined),
      sampleTypeDictionary: {
        findUnique: jest.fn().mockResolvedValue({ id: 1, slug: 'other' }),
      },
      sample: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ code: `10_${base}` }]),
        create: jest.fn().mockResolvedValue({ id: 42 }),
        update: jest.fn().mockResolvedValue({ id: 42 }),
      },
    };

    prisma.$transaction = jest.fn(async (cb) => cb(tx));

    await service.create({
      sampleTypeId: 1,
      subject: 'До-обработки,-БЦБК',
      siteName: 'Test',
      collectedAt: new Date().toISOString(),
    });

    expect(tx.sample.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { code: `42_${base}-1` },
      }),
    );
  });

  it('adds numeric suffix when updating to a duplicate sample display code', async () => {
    const base = 'other_До-обработки,-БЦБК';
    const tx = {
      $executeRaw: jest.fn().mockResolvedValue(undefined),
      sampleTypeDictionary: {
        findUnique: jest.fn().mockResolvedValue({ id: 1, slug: 'other' }),
      },
      sample: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ sampleTypeId: 1, subject: 'Old' }),
        findMany: jest
          .fn()
          .mockResolvedValue([
            { code: `10_${base}` },
            { code: `11_${base}-1` },
          ]),
        update: jest.fn().mockResolvedValue({ id: 5 }),
      },
    };

    prisma.$transaction = jest.fn(async (cb) => cb(tx));

    await service.update(5, {
      subject: 'До-обработки,-БЦБК',
    });

    expect(tx.sample.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          code: `5_${base}-2`,
          subject: 'До-обработки,-БЦБК',
        }),
      }),
    );
  });
});
