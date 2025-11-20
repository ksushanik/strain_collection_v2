import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStorageBoxDto } from './dto/create-storage-box.dto';
import { AllocateStrainDto } from './dto/allocate-strain.dto';

@Injectable()
export class StorageService {
    constructor(private prisma: PrismaService) { }

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
        const { rows, cols, ...boxData } = createBoxDto;

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
        const { cellId, strainId } = allocateDto;

        // Check if cell exists
        const cell = await this.prisma.storageCell.findUnique({
            where: { id: cellId },
            include: { strain: true },
        });

        if (!cell) {
            throw new NotFoundException(`Storage cell with ID ${cellId} not found`);
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
            where: { id: cellId },
            data: { status: 'OCCUPIED' },
        });

        const allocation = await this.prisma.strainStorage.create({
            data: {
                strainId,
                cellId,
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

    async deallocateStrain(allocationId: number) {
        const allocation = await this.prisma.strainStorage.findUnique({
            where: { id: allocationId },
            include: { cell: true },
        });

        if (!allocation) {
            throw new NotFoundException(`Allocation with ID ${allocationId} not found`);
        }

        // Update cell status to FREE
        await this.prisma.storageCell.update({
            where: { id: allocation.cellId },
            data: { status: 'FREE' },
        });

        await this.prisma.strainStorage.delete({
            where: { id: allocationId },
        });

        return { message: `Strain deallocated successfully` };
    }
}
