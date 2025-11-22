import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStorageBoxDto } from './dto/create-storage-box.dto';
import { AllocateStrainDto, BulkAllocateStrainDto } from './dto/allocate-strain.dto';

@Injectable()
export class StorageService {
  constructor(private prisma: PrismaService) {}

  async findAllBoxes() {
    return this.prisma.storageBox.findMany({
      include: {
        _count: {
          select: { cells: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBox(id: number) {
    const box = await this.prisma.storageBox.findUnique({
      where: { id },
      include: {
        cells: {
          include: {
            strain: {
              include: {
                strain: {
                  select: {
                    id: true,
                    identifier: true,
                    seq: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!box) {
      throw new NotFoundException(`Storage box with ID ${id} not found`);
    }

    return box;
  }

  async createBox(createBoxDto: CreateStorageBoxDto) {
    const { rows, cols, storageType, ...boxData } = createBoxDto;

    if (![9, 10].includes(rows) || ![9, 10].includes(cols)) {
      throw new BadRequestException('Rows and cols must be either 9 or 10');
    }

    // Create box with cells
    const box = await this.prisma.storageBox.create({
      data: {
        ...boxData,
        rows,
        cols,
        cells: {
          create: Array.from({ length: rows * cols }, (_, i) => ({
            row: Math.floor(i / cols) + 1,
            col: (i % cols) + 1,
            cellCode: `${String.fromCharCode(65 + Math.floor(i / cols))}${(i % cols) + 1}`,
          })),
        },
      },
      include: {
        cells: true,
      },
    });

    return box;
  }

  async allocateStrain(allocateDto: AllocateStrainDto) {
    const { boxId, cellCode, strainId, isPrimary = false } = allocateDto;

    // Check if cell exists
    const cell = await this.prisma.storageCell.findFirst({
      where: { boxId, cellCode },
      include: { strain: true, box: true },
    });

    if (!cell) {
      throw new NotFoundException(`Storage cell ${cellCode} in box ${boxId} not found`);
    }

    // Check if strain exists
    const strain = await this.prisma.strain.findUnique({
      where: { id: strainId },
    });

    if (!strain) {
      throw new NotFoundException(`Strain with ID ${strainId} not found`);
    }

    // Check if cell is already occupied
    if (cell.strain) {
      throw new BadRequestException(`Cell is already occupied`);
    }

    // Update cell status and create allocation
    await this.prisma.storageCell.update({
      where: { id: cell.id },
      data: { status: 'OCCUPIED' },
    });

    const allocation = await this.prisma.strainStorage.create({
      data: {
        strainId,
        cellId: cell.id,
        isPrimary,
      },
      include: {
        strain: {
          select: {
            id: true,
            identifier: true,
          },
        },
        cell: {
          include: {
            box: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    return allocation;
  }

  async bulkAllocate(dto: BulkAllocateStrainDto) {
    const { boxId, allocations } = dto;
    const results = [];

    for (const alloc of allocations) {
      const allocation = await this.allocateStrain({
        boxId,
        cellCode: alloc.cellCode,
        strainId: alloc.strainId,
        isPrimary: alloc.isPrimary,
      });
      results.push(allocation);
    }

    return results;
  }

  async deallocateStrain(boxId: number, cellCode: string) {
    const cell = await this.prisma.storageCell.findFirst({
      where: { boxId, cellCode },
    });

    if (!cell) {
      throw new NotFoundException(
        `Storage cell ${cellCode} in box ${boxId} not found`,
      );
    }

    const allocation = await this.prisma.strainStorage.findUnique({
      where: { cellId: cell.id },
    });

    if (!allocation) {
      throw new NotFoundException(
        `No allocation found for cell ${cellCode} in box ${boxId}`,
      );
    }

    // Update cell status to FREE
    await this.prisma.storageCell.update({
      where: { id: cell.id },
      data: { status: 'FREE' },
    });

    await this.prisma.strainStorage.delete({
      where: { id: allocation.id },
    });

    return { message: `Strain deallocated successfully` };
  }
}
