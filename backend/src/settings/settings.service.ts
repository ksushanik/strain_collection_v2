import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getUiBindings() {
    const bindings = await this.prisma.uiBinding.findMany({
      orderBy: { id: 'asc' },
    });

    return bindings.map((b) => ({
      id: b.id,
      menuLabel: b.menuLabel,
      profileKey: b.profileKey,
      icon: b.icon || 'Box',
      enabledFieldPacks: b.enabledFieldPacks,
      routeSlug: b.routeSlug,
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
        order: index,
      })),
    });

    return { updated: created.count };
  }
}
