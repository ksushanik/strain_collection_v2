import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) { }

  async overview() {
    const [
      totalStrains,
      totalSamples,
      totalCells,
      occupiedCells,
      totalBoxes,
      recentStrains,
    ] = await Promise.all([
      this.prisma.strain.count(),
      this.prisma.sample.count(),
      this.prisma.storageCell.count(),
      this.prisma.storageCell.count({ where: { status: 'OCCUPIED' } }),
      this.prisma.storageBox.count(),
      this.prisma.strain.findMany({
        orderBy: { createdAt: 'desc' },
        take: 9,
        select: {
          id: true,
          identifier: true,
          createdAt: true,
          sample: {
            select: { id: true, code: true },
          },
        },
      }),
    ]);

    return {
      totalStrains,
      totalSamples,
      totalBoxes,
      occupiedCells,
      freeCells: totalCells - occupiedCells,
      recentAdditions: recentStrains,
    };
  }
}
