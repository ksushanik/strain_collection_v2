import { BadRequestException, Injectable } from '@nestjs/common';
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

  async getIndexers() {
    return this.prisma.indexer.findMany({
      orderBy: { index: 'asc' },
    });
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

  async updateIndexers(payload: { index: string; fullName: string }[]) {
    const trimmed = payload.map((item) => ({
      index: (item.index ?? '').trim(),
      fullName: (item.fullName ?? '').trim(),
    }));

    const nonEmpty = trimmed.filter((item) => item.index || item.fullName);
    for (const item of nonEmpty) {
      if (!item.index) {
        throw new BadRequestException('Indexer index is required');
      }
      if (!item.fullName) {
        throw new BadRequestException('Indexer full name is required');
      }
    }

    const seen = new Set<string>();
    for (const item of nonEmpty) {
      if (seen.has(item.index)) {
        throw new BadRequestException('Indexer index must be unique');
      }
      seen.add(item.index);
    }

    await this.prisma.indexer.deleteMany();

    if (nonEmpty.length === 0) {
      return { updated: 0 };
    }

    const created = await this.prisma.indexer.createMany({
      data: nonEmpty.map((item) => ({
        index: item.index,
        fullName: item.fullName,
      })),
    });

    return { updated: created.count };
  }

  async createUiBinding(binding: {
    menuLabel: string;
    profileKey: ProfileKey;
    icon?: string | null;
    enabledFieldPacks?: string[];
    routeSlug: string;
    order?: number;
    legendId?: number | null;
  }) {
    return this.prisma.uiBinding.create({
      data: {
        menuLabel: binding.menuLabel,
        profileKey: binding.profileKey,
        icon: binding.icon || 'Box',
        enabledFieldPacks: binding.enabledFieldPacks || [],
        routeSlug: binding.routeSlug,
        order: binding.order ?? 0,
        legendId: binding.legendId ?? null,
      },
    });
  }

  async updateUiBinding(
    id: number,
    binding: {
      menuLabel?: string;
      profileKey?: ProfileKey;
      icon?: string | null;
      enabledFieldPacks?: string[];
      routeSlug?: string;
      order?: number;
      legendId?: number | null;
    },
  ) {
    return this.prisma.uiBinding.update({
      where: { id },
      data: {
        menuLabel: binding.menuLabel,
        profileKey: binding.profileKey,
        icon: binding.icon ?? undefined,
        enabledFieldPacks: binding.enabledFieldPacks,
        routeSlug: binding.routeSlug,
        order: binding.order,
        legendId: binding.legendId,
      },
    });
  }

  async deleteUiBinding(id: number) {
    return this.prisma.uiBinding.delete({ where: { id } });
  }

  async deleteLegend(id: number) {
    return this.prisma.legendContent.delete({ where: { id } });
  }
}
