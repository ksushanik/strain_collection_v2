import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getUiBindings() {
    const bindings = await this.prisma.uiBinding.findMany({
      orderBy: [{ order: 'asc' } as any],
      include: { legend: true },
    });

    return bindings.map((b) => ({
      id: b.id,
      menuLabel: b.menuLabel,
      profileKey: b.profileKey,
      icon: b.icon || 'Box',
      enabledFieldPacks: b.enabledFieldPacks,
      routeSlug: b.routeSlug,
      order: (b as any).order ?? 0,
      legend: (b as any).legend,
    }));
  }

  async updateUiBindings(bindings: any[]) {
    // Delete all existing, then recreate
    await this.prisma.uiBinding.deleteMany();

    const created = await this.prisma.uiBinding.createMany({
      data: bindings.map((b, index) => ({
        menuLabel: b.menuLabel,
        profileKey: b.profileKey,
        icon: b.icon || 'Box',
        enabledFieldPacks: b.enabledFieldPacks || [],
        routeSlug: b.routeSlug,
        order: b.order ?? index,
        legendId: b.legendId ?? null,
      })),
    });

    return { updated: created.count };
  }

  async getLegend() {
    const legend = await this.prisma.legendContent.findFirst({
      orderBy: { id: 'asc' },
    });
    return legend;
  }

  async updateLegend(payload: { content: string }) {
    const existing = await this.prisma.legendContent.findFirst({
      orderBy: { id: 'asc' },
    });

    if (!existing) {
      const created = await this.prisma.legendContent.create({
        data: { content: payload.content },
      });
      return created;
    }

    return this.prisma.legendContent.update({
      where: { id: existing.id },
      data: { content: payload.content },
    });
  }
}
