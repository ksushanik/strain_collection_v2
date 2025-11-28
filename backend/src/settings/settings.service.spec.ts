import { Test } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SettingsService', () => {
  let service: SettingsService;
  const prisma = {
    legendContent: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    uiBinding: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(SettingsService);
  });

  it('creates legend when none exists', async () => {
    prisma.legendContent.findFirst = jest.fn().mockResolvedValue(null);
    prisma.legendContent.create = jest
      .fn()
      .mockResolvedValue({ id: 1, content: 'text' });

    const res = await service.updateLegend({ content: 'text' });
    expect(prisma.legendContent.create).toHaveBeenCalledWith({
      data: { content: 'text' },
    });
    expect(res).toEqual({ id: 1, content: 'text' });
  });

  it('updates legend when exists', async () => {
    prisma.legendContent.findFirst = jest
      .fn()
      .mockResolvedValue({ id: 2, content: 'old' });
    prisma.legendContent.update = jest
      .fn()
      .mockResolvedValue({ id: 2, content: 'new' });

    const res = await service.updateLegend({ content: 'new' });
    expect(prisma.legendContent.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { content: 'new' },
    });
    expect(res).toEqual({ id: 2, content: 'new' });
  });
});
