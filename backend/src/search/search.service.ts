import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { SettingsService } from '../settings/settings.service';
import { GlobalSearchResponse, SearchHit, SearchSection } from './search.types';
import fs from 'fs/promises';
import path from 'path';
import type { User } from '@prisma/client';

type SearchInput = {
  user?: Parameters<CaslAbilityFactory['createForUser']>[0];
  query: string;
  mode: 'preview' | 'full';
  perSection?: number;
};

type WikiDocMeta = { id: string; title: string; file: string };

const WIKI_DOCS: WikiDocMeta[] = [
  { id: 'index', title: 'Index', file: 'index.md' },
  { id: 'architecture', title: 'Architecture & Overview', file: 'architecture.md' },
  { id: 'backend', title: 'Backend (NestJS/Prisma)', file: 'backend.md' },
  { id: 'frontend', title: 'Frontend (Next.js)', file: 'frontend.md' },
  { id: 'api', title: 'API & Auth', file: 'api.md' },
  { id: 'storage', title: 'Storage', file: 'storage.md' },
  { id: 'media', title: 'Media', file: 'media.md' },
  { id: 'methods', title: 'Methods', file: 'methods.md' },
  { id: 'maps', title: 'Maps Integration', file: 'maps.md' },
  { id: 'legend', title: 'Legend', file: 'legend.md' },
  { id: 'admin', title: 'Admin (AdminJS)', file: 'admin.md' },
  { id: 'testing', title: 'Testing', file: 'testing.md' },
  { id: 'playbooks', title: 'Playbooks', file: 'playbooks.md' },
  { id: 'changelog', title: 'Changelog', file: 'changelog.md' },
  { id: 'audit', title: 'Audit Log', file: 'audit.md' },
  { id: 'contrib', title: 'Wiki Contribution Guide', file: 'contrib.md' },
];

function makeSnippet(text: string, q: string, radius = 80) {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx === -1) return null;
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + q.length + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return prefix + text.slice(start, end).replace(/\s+/g, ' ').trim() + suffix;
}

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private caslAbilityFactory: CaslAbilityFactory,
    private settingsService: SettingsService,
  ) {}

  async search(input: SearchInput): Promise<GlobalSearchResponse> {
    const q = input.query.trim();
    const mode = input.mode;
    const perSection =
      input.perSection ?? (mode === 'preview' ? 3 : 10);

    const ability = this.caslAbilityFactory.createForUser(
      input.user ?? { role: 'GUEST' },
    );

    const sectionsOrder: SearchSection[] = [
      'strains',
      'samples',
      'storage',
      'media',
      'methods',
      'legend',
      'wiki',
    ];

    const empty: Record<SearchSection, SearchHit[]> = {
      strains: [],
      samples: [],
      storage: [],
      media: [],
      methods: [],
      legend: [],
      wiki: [],
    };

    const tasks: Partial<Record<SearchSection, Promise<SearchHit[]>>> = {};

    if (ability.can('read', 'Strain')) {
      tasks.strains = this.searchStrains(q, perSection);
    }
    if (ability.can('read', 'Sample')) {
      tasks.samples = this.searchSamples(q, perSection);
    }
    if (ability.can('read', 'Storage')) {
      tasks.storage = this.searchStorage(q, perSection);
    }
    if (ability.can('read', 'Media')) {
      tasks.media = this.searchMedia(q, perSection);
    }
    if (ability.can('read', 'Method')) {
      tasks.methods = this.searchMethods(q, perSection);
    }
    if (ability.can('read', 'Legend')) {
      tasks.legend = this.searchLegend(q);
    }
    // Wiki is internal docs; gate it by Settings read (available to same roles as other read-only UI)
    if (ability.can('read', 'Settings')) {
      tasks.wiki = this.searchWiki(q, perSection);
    }

    const settled = await Promise.all(
      sectionsOrder.map(async (section) => {
        const task = tasks[section];
        if (!task) return [section, empty[section]] as const;
        try {
          const hits = await task;
          return [section, hits] as const;
        } catch {
          return [section, [] as SearchHit[]] as const;
        }
      }),
    );

    const sections = { ...empty };
    for (const [section, hits] of settled) {
      sections[section] = hits;
    }

    return {
      query: q,
      mode,
      perSection,
      sections,
    };
  }

  private async searchStrains(q: string, take: number): Promise<SearchHit[]> {
    const strains = await this.prisma.strain.findMany({
      where: {
        OR: [
          { identifier: { contains: q, mode: 'insensitive' } },
          { ncbiScientificName: { contains: q, mode: 'insensitive' } },
          { taxonomy16s: { contains: q, mode: 'insensitive' } },
          { otherTaxonomy: { contains: q, mode: 'insensitive' } },
          { features: { contains: q, mode: 'insensitive' } },
          { comments: { contains: q, mode: 'insensitive' } },
          { sample: { is: { code: { contains: q, mode: 'insensitive' } } } },
        ],
      },
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        sample: { select: { id: true, code: true } },
      },
    });

    return strains.map((s) => ({
      section: 'strains',
      id: String(s.id),
      title: s.identifier,
      snippet: s.sample?.code ? `Sample: ${s.sample.code}` : null,
      href: `/strains/${s.id}`,
      metadata: {
        sampleId: s.sampleId,
        sampleCode: s.sample?.code ?? null,
      },
    }));
  }

  private async searchSamples(q: string, take: number): Promise<SearchHit[]> {
    const samples = await this.prisma.sample.findMany({
      where: {
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { siteName: { contains: q, mode: 'insensitive' } },
          { subject: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take,
      orderBy: { createdAt: 'desc' },
    });

    return samples.map((s) => ({
      section: 'samples',
      id: String(s.id),
      title: s.code,
      snippet: s.siteName ? `Site: ${s.siteName}` : null,
      href: `/samples/${s.id}`,
      metadata: {
        sampleType: s.sampleType,
      },
    }));
  }

  private async searchStorage(q: string, take: number): Promise<SearchHit[]> {
    const [boxes, cells] = await Promise.all([
      this.prisma.storageBox.findMany({
        where: {
          OR: [
            { displayName: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.storageCell.findMany({
        where: {
          OR: [
            { cellCode: { contains: q, mode: 'insensitive' } },
            {
              strain: {
                is: {
                  strain: {
                    is: { identifier: { contains: q, mode: 'insensitive' } },
                  },
                },
              },
            },
          ],
        },
        take,
        orderBy: [{ boxId: 'asc' }, { row: 'asc' }, { col: 'asc' }],
        include: {
          box: { select: { id: true, displayName: true } },
          strain: {
            include: {
              strain: { select: { id: true, identifier: true } },
            },
          },
        },
      }),
    ]);

    const boxHits: SearchHit[] = boxes.map((b) => ({
      section: 'storage',
      id: `box:${b.id}`,
      title: b.displayName,
      snippet: b.description ?? null,
      href: `/storage?boxId=${b.id}`,
      metadata: { boxId: b.id },
    }));

    const cellHits: SearchHit[] = cells.map((c) => ({
      section: 'storage',
      id: `cell:${c.id}`,
      title: `${c.box.displayName} · ${c.cellCode}`,
      snippet: c.strain?.strain?.identifier
        ? `Strain: ${c.strain.strain.identifier}`
        : null,
      href: `/storage?boxId=${c.boxId}&cell=${encodeURIComponent(c.cellCode)}`,
      metadata: {
        boxId: c.boxId,
        cellCode: c.cellCode,
        strainId: c.strain?.strain?.id ?? null,
      },
    }));

    // Merge and keep deterministic order
    return [...boxHits, ...cellHits].slice(0, take);
  }

  private async searchMedia(q: string, take: number): Promise<SearchHit[]> {
    const items = await this.prisma.media.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { composition: { contains: q, mode: 'insensitive' } },
        ],
      },
      take,
      orderBy: { createdAt: 'desc' },
    });

    return items.map((m) => ({
      section: 'media',
      id: String(m.id),
      title: m.name,
      snippet: m.composition ? makeSnippet(m.composition, q) : null,
      href: `/media`,
      metadata: { mediaId: m.id },
    }));
  }

  private async searchMethods(q: string, take: number): Promise<SearchHit[]> {
    const items = await this.prisma.method.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take,
      orderBy: { createdAt: 'desc' },
    });

    return items.map((m) => ({
      section: 'methods',
      id: String(m.id),
      title: m.name,
      snippet: m.description ? makeSnippet(m.description, q) : null,
      href: `/methods`,
      metadata: { methodId: m.id },
    }));
  }

  private async searchLegend(q: string): Promise<SearchHit[]> {
    const legend = await this.settingsService.getLegend();
    const content = legend?.content ?? '';
    if (!content) return [];
    if (!content.toLowerCase().includes(q.toLowerCase())) return [];

    return [
      {
        section: 'legend',
        id: 'legend',
        title: 'Legend',
        snippet: makeSnippet(content, q),
        href: `/legend`,
      },
    ];
  }

  private async searchWiki(q: string, take: number): Promise<SearchHit[]> {
    const wikiBasePath =
      process.env.WIKI_PATH || path.join(process.cwd(), '../docs/wiki');

    const qLower = q.toLowerCase();

    const hits: SearchHit[] = [];
    for (const doc of WIKI_DOCS) {
      if (hits.length >= take) break;

      const filePath = path.resolve(wikiBasePath, doc.file);
      const content = await fs.readFile(filePath, 'utf-8').catch(() => '');
      if (!content) continue;

      const lower = content.toLowerCase();
      if (!lower.includes(qLower) && !doc.title.toLowerCase().includes(qLower)) {
        continue;
      }

      hits.push({
        section: 'wiki',
        id: doc.id,
        title: doc.title,
        snippet: makeSnippet(content, q) ?? null,
        href: `/docs#${doc.id}`,
        metadata: { file: doc.file },
      });
    }

    return hits;
  }
}
