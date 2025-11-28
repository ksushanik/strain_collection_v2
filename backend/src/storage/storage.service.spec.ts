import { Test } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('StorageService', () => {
  let service: StorageService;
  const prisma = {
    storageBox: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    storageCell: { findFirst: jest.fn(), update: jest.fn() },
    strain: { findUnique: jest.fn() },
    strainStorage: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [StorageService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(StorageService);
  });

  it('throws when cell not found on allocate', async () => {
    prisma.storageCell.findFirst = jest.fn().mockResolvedValue(null);
    await expect(
      service.allocateStrain({ boxId: 1, cellCode: 'A1', strainId: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when strain not found on allocate', async () => {
    prisma.storageCell.findFirst = jest
      .fn()
      .mockResolvedValue({ id: 1, boxId: 1, cellCode: 'A1' });
    prisma.strain.findUnique = jest.fn().mockResolvedValue(null);
    await expect(
      service.allocateStrain({ boxId: 1, cellCode: 'A1', strainId: 99 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates primary flag when same strain already allocated', async () => {
    prisma.storageCell.findFirst = jest
      .fn()
      .mockResolvedValue({ id: 1, boxId: 1, cellCode: 'A1', strain: {} });
    prisma.strain.findUnique = jest.fn().mockResolvedValue({ id: 5 });
    prisma.strainStorage.findUnique = jest
      .fn()
      .mockResolvedValueOnce({ id: 10, strainId: 5 })
      .mockResolvedValueOnce({
        id: 10,
        strain: { id: 5, identifier: 'S-5' },
        cell: { box: { id: 1, displayName: 'Box' } },
      } as any);
    prisma.strainStorage.update = jest.fn().mockResolvedValue({ id: 10 });

    const res = await service.allocateStrain({
      boxId: 1,
      cellCode: 'A1',
      strainId: 5,
      isPrimary: true,
    });

    expect(prisma.strainStorage.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { isPrimary: true },
    });
    expect(res?.strain?.id).toBe(5);
  });

  it('reassigns when different strain occupies cell', async () => {
    prisma.storageCell.findFirst = jest.fn().mockResolvedValue({
      id: 1,
      boxId: 1,
      cellCode: 'A1',
      strain: { id: 2 },
    });
    prisma.strain.findUnique = jest.fn().mockResolvedValue({ id: 5 });
    prisma.strainStorage.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 11, strainId: 2 });
    prisma.strainStorage.delete = jest.fn().mockResolvedValue({});
    prisma.storageCell.update = jest.fn().mockResolvedValue({});
    prisma.strainStorage.create = jest.fn().mockResolvedValue({
      id: 12,
      strain: { id: 5, identifier: 'S-5' },
      cell: { box: { id: 1, displayName: 'Box' } },
    } as any);

    const res = await service.allocateStrain({
      boxId: 1,
      cellCode: 'A1',
      strainId: 5,
      isPrimary: false,
    });

    expect(prisma.strainStorage.delete).toHaveBeenCalledWith({
      where: { cellId: 1 },
    });
    expect(prisma.storageCell.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'OCCUPIED' },
    });
    expect(prisma.strainStorage.create).toHaveBeenCalled();
    expect(res?.strain?.id).toBe(5);
  });

  it('deallocates and marks cell free', async () => {
    prisma.storageCell.findFirst = jest
      .fn()
      .mockResolvedValue({ id: 1, boxId: 1, cellCode: 'A1' });
    prisma.strainStorage.findUnique = jest.fn().mockResolvedValue({ id: 99 });
    prisma.storageCell.update = jest.fn().mockResolvedValue({});
    prisma.strainStorage.delete = jest.fn().mockResolvedValue({});

    const res = await service.deallocateStrain(1, 'A1');
    expect(prisma.storageCell.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'FREE' },
    });
    expect(prisma.strainStorage.delete).toHaveBeenCalledWith({
      where: { id: 99 },
    });
    expect(res).toEqual({ message: 'Strain deallocated successfully' });
  });
});
