import { Test } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('StorageService', () => {
  let service: StorageService;
  let prisma: PrismaService;

  beforeEach(async () => {
    // Define mockPrisma here so it is fresh for each test
    const mockPrisma = {
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
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
    };

    const module = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(StorageService);
    prisma = module.get(PrismaService);
  });

  it('throws when cell not found on allocate', async () => {
    (prisma.storageCell.findFirst as jest.Mock).mockResolvedValue(null);
    await expect(
      service.allocateStrain({ boxId: 1, cellCode: 'A1', strainId: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when strain not found on allocate', async () => {
    (prisma.storageCell.findFirst as jest.Mock).mockResolvedValue({ id: 1, boxId: 1, cellCode: 'A1' });
    (prisma.strain.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(
      service.allocateStrain({ boxId: 1, cellCode: 'A1', strainId: 99 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates primary flag when same strain already allocated', async () => {
    (prisma.storageCell.findFirst as jest.Mock).mockResolvedValue({ id: 1, boxId: 1, cellCode: 'A1', strain: {} });
    (prisma.strain.findUnique as jest.Mock).mockResolvedValue({ id: 5 });
    
    // Sequence of findUnique calls:
    // 1. existingInCell (inside transaction)
    // 2. return value (outside transaction)
    (prisma.strainStorage.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 10, strainId: 5 })
      .mockResolvedValueOnce({
        id: 10,
        strain: { id: 5, identifier: 'S-5' },
        cell: { box: { id: 1, displayName: 'Box' } },
      } as any);
      
    (prisma.strainStorage.update as jest.Mock).mockResolvedValue({ id: 10 });

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
    (prisma.storageCell.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      boxId: 1,
      cellCode: 'A1',
      strain: { id: 2 },
    });
    (prisma.strain.findUnique as jest.Mock).mockResolvedValue({ id: 5 });
    
    // Sequence of findUnique calls:
    // 1. existingInCell (inside transaction) - returns strain 2
    // 2. return value (outside transaction) - returns new allocation
    (prisma.strainStorage.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 11, strainId: 2 })
      .mockResolvedValueOnce({
          id: 12,
          strain: { id: 5, identifier: 'S-5' },
          cell: { box: { id: 1, displayName: 'Box' } },
        } as any);

    (prisma.strainStorage.delete as jest.Mock).mockResolvedValue({});
    (prisma.storageCell.update as jest.Mock).mockResolvedValue({});
    (prisma.strainStorage.create as jest.Mock).mockResolvedValue({
      id: 12,
      strain: { id: 5, identifier: 'S-5' },
      cell: { box: { id: 1, displayName: 'Box' } },
    } as any);

    const res = await service.allocateStrain({
      boxId: 1,
      cellCode: 'A1',
      strainId: 5,
      isPrimary: true,
    });

    expect(prisma.strainStorage.delete).toHaveBeenCalledWith({
      where: { id: 11 },
    });
    expect(prisma.strainStorage.create).toHaveBeenCalled();
    expect(res?.strain?.id).toBe(5);
  });
});
