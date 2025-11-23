import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileKey } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getUiBindings() {
    const bindings = await this.prisma.uiBinding.findMany({
      orderBy: [{ order: 'asc' }],
      include: { legend: true },
    });

    return bindings.map((b) => ({
      id: b.id,
      menuLabel: b.menuLabel,
      profileKey: b.profileKey,
      icon: b.icon || 'Box',
      enabledFieldPacks: Array.isArray(b.enabledFieldPacks)
        ? (b.enabledFieldPacks as unknown[]).filter(
            (x): x is string => typeof x === 'string',
          )
        : [],
      routeSlug: b.routeSlug,
      order: b.order ?? 0,
      legend: b.legend,
    }));
  }

  async updateUiBindings(
    bindings: {
      menuLabel: string;
      profileKey: string;
      icon?: string | null;
      enabledFieldPacks?: string[];
      routeSlug: string;
      order?: number;
      legendId?: number | null;
    }[],
  ) {
    // Delete all existing, then recreate
    await this.prisma.uiBinding.deleteMany();

    const created = await this.prisma.uiBinding.createMany({
      data: bindings.map((b, index) => ({
        menuLabel: b.menuLabel,
        profileKey: b.profileKey as ProfileKey,
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
