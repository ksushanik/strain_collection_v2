import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient, TraitDataType } from '@prisma/client';

const prisma = new PrismaClient();

type BackupJson = {
  sampleTypeDictionary: Array<{ id: number; name: string; slug: string }>;
  samples: Array<{
    id: number;
    code: string;
    sampleType: 'PLANT' | 'ANIMAL' | 'WATER' | 'SOIL' | 'OTHER';
    sampleTypeId: number | null;
    subject: string | null;
    siteName: string | null;
    lat: number | null;
    lng: number | null;
    description: string | null;
    collectedAt: string;
    createdAt: string;
    updatedAt: string;
    customFields: unknown | null;
  }>;
  samplePhotos: Array<{ id: number; sampleId: number; url: string; meta: unknown | null; createdAt: string }>;
  strains: Array<{
    id: number;
    identifier: string;
    sampleId: number;
    taxonomy16s: string | null;
    otherTaxonomy: string | null;
    indexerInitials: string | null;
    collectionRcam: string | null;
    isolationRegion: 'RHIZOSPHERE' | 'ENDOSPHERE' | 'PHYLLOSPHERE' | 'SOIL' | 'OTHER' | null;
    features: string | null;
    comments: string | null;
    createdAt: string;
    updatedAt: string;
    customFields: unknown | null;
    // Legacy phenotype columns (pre-v2)
    seq: boolean;
    antibioticActivity: string | null;
    gramStain: 'POSITIVE' | 'NEGATIVE' | 'VARIABLE' | null;
    phosphates: boolean;
    siderophores: boolean;
    pigmentSecretion: boolean;
    amylase: 'POSITIVE' | 'NEGATIVE' | '' | null;
    iuk: string | null;
  }>;
  strainPhotos: Array<{ id: number; strainId: number; url: string; meta: unknown | null; createdAt: string }>;
  strainMedia: Array<{ strainId: number; mediaId: number; notes: string | null }>;
  strainStorage: Array<{ id: number; strainId: number; cellId: number; isPrimary: boolean; allocatedAt: string }>;
  storageBoxes: Array<{
    id: number;
    displayName: string;
    rows: number;
    cols: number;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  storageCells: Array<{
    id: number;
    boxId: number;
    row: number;
    col: number;
    cellCode: string;
    status: 'FREE' | 'OCCUPIED';
  }>;
  media: Array<{ id: number; name: string; composition: string | null; createdAt: string }>;
  legendContent:
    | { id: number; content: string; updatedAt: string }
    | Array<{ id: number; content: string; updatedAt: string }>
    | null;
  uiBindings: Array<{
    id: number;
    menuLabel: string;
    profileKey: 'SAMPLE' | 'STRAIN' | 'MEDIA' | 'STORAGE';
    order: number;
    legendId: number | null;
    routeSlug: string;
    icon: string | null;
    enabledFieldPacks: unknown;
    updatedAt: string;
  }>;
};

function trimOrNull(value: string | null | undefined) {
  const v = (value ?? '').trim();
  return v.length ? v : null;
}

function mapPosNeg(value: string | null | undefined) {
  const v = (value ?? '').trim().toUpperCase();
  if (!v) return null;
  if (v === 'POSITIVE') return '+';
  if (v === 'NEGATIVE') return '-';
  if (v === 'VARIABLE') return 'variable';
  return v;
}

async function ensureSystemTraits() {
  const systemTraits = [
    {
      code: 'gram_stain',
      name: 'Gram Stain',
      dataType: TraitDataType.CATEGORICAL,
      isSystem: true,
      defaultMethod: 'Microscopy',
      options: ['+', '-', 'variable'],
      category: 'MORPHOLOGY',
    },
    {
      code: 'amylase',
      name: 'Amylase',
      dataType: TraitDataType.CATEGORICAL,
      isSystem: true,
      defaultMethod: '',
      options: ['+', '-'],
      category: 'BIOCHEMISTRY',
    },
    {
      code: 'iuk_iaa',
      name: 'IUK / IAA',
      dataType: TraitDataType.TEXT,
      isSystem: true,
      defaultMethod: '',
      options: null,
      category: 'BIOCHEMISTRY',
    },
    {
      code: 'antibiotic_activity',
      name: 'Antibiotic Activity',
      dataType: TraitDataType.TEXT,
      isSystem: true,
      defaultMethod: '',
      options: null,
      category: 'BIOCHEMISTRY',
    },
    {
      code: 'sequenced_seq',
      name: 'Sequenced (SEQ)',
      dataType: TraitDataType.BOOLEAN,
      isSystem: true,
      defaultMethod: '',
      options: null,
      category: 'GENETICS',
    },
    {
      code: 'phosphate_solubilization',
      name: 'Phosphate Solubilization',
      dataType: TraitDataType.BOOLEAN,
      isSystem: true,
      defaultMethod: '',
      options: null,
      category: 'GROWTH',
    },
    {
      code: 'siderophore_production',
      name: 'Siderophore Production',
      dataType: TraitDataType.BOOLEAN,
      isSystem: true,
      defaultMethod: '',
      options: null,
      category: 'GROWTH',
    },
    {
      code: 'pigment_secretion',
      name: 'Pigment Secretion',
      dataType: TraitDataType.BOOLEAN,
      isSystem: true,
      defaultMethod: '',
      options: null,
      category: 'GROWTH',
    },
  ] as const;

  for (const t of systemTraits) {
    await prisma.traitDefinition.upsert({
      where: { code: t.code },
      create: {
        code: t.code,
        name: t.name,
        dataType: t.dataType,
        category: t.category,
        defaultMethod: t.defaultMethod,
        isSystem: true,
        options: t.options as any,
      },
      update: {
        name: t.name,
        dataType: t.dataType,
        category: t.category,
        defaultMethod: t.defaultMethod,
        isSystem: true,
        options: t.options as any,
      },
    });
  }

  const all = await prisma.traitDefinition.findMany({
    where: { code: { in: systemTraits.map((t) => t.code) } },
    select: { id: true, code: true, name: true },
  });
  const map = new Map<string, { id: number; name: string }>();
  all.forEach((d) => map.set(d.code, { id: d.id, name: d.name }));
  return map;
}

async function resetSequences() {
  const pairs: Array<{ table: string; column: string }> = [
    { table: 'sample_types', column: 'id' },
    { table: 'samples', column: 'id' },
    { table: 'sample_photos', column: 'id' },
    { table: 'strains', column: 'id' },
    { table: 'strain_photos', column: 'id' },
    { table: 'media', column: 'id' },
    { table: 'storage_boxes', column: 'id' },
    { table: 'storage_cells', column: 'id' },
    { table: 'strain_storage', column: 'id' },
    { table: 'legend_content', column: 'id' },
    { table: 'ui_bindings', column: 'id' },
    { table: 'trait_definitions', column: 'id' },
    { table: 'strain_phenotypes', column: 'id' },
    { table: 'strain_genetics', column: 'id' },
  ];

  for (const { table, column } of pairs) {
    // setval(seq, max(id), true) makes the next value max(id)+1
    const sql = `
      SELECT setval(
        pg_get_serial_sequence('"${table}"', '${column}'),
        COALESCE((SELECT MAX("${column}") FROM "${table}"), 1),
        true
      );
    `;
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch {
      // Some tables may not exist in a given environment or may not have a serial sequence.
    }
  }
}

async function main() {
  const arg = process.argv[2];
  const filePath = arg
    ? path.resolve(process.cwd(), arg)
    : path.resolve(process.cwd(), '..', 'backup', 'backup-2025-12-17T04-56-56.618Z.json');

  const raw = fs.readFileSync(filePath, 'utf8');
  const backup = JSON.parse(raw) as BackupJson;

  console.log(`Importing backup from: ${filePath}`);
  console.log(
    `Counts: samples=${backup.samples.length} strains=${backup.strains.length} media=${backup.media.length} cells=${backup.storageCells.length}`,
  );

  const traitMap = await ensureSystemTraits();

  for (const st of backup.sampleTypeDictionary) {
    await prisma.sampleTypeDictionary.upsert({
      where: { id: st.id },
      create: { id: st.id, name: st.name, slug: st.slug },
      update: { name: st.name, slug: st.slug },
    });
  }

  for (const s of backup.samples) {
    await prisma.sample.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        code: s.code,
        sampleType: s.sampleType,
        sampleTypeId: s.sampleTypeId,
        subject: s.subject,
        siteName: s.siteName ?? '',
        lat: s.lat,
        lng: s.lng,
        description: s.description,
        collectedAt: new Date(s.collectedAt),
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        customFields: (s.customFields as any) ?? undefined,
      },
      update: {
        code: s.code,
        sampleType: s.sampleType,
        sampleTypeId: s.sampleTypeId,
        subject: s.subject,
        siteName: s.siteName ?? '',
        lat: s.lat,
        lng: s.lng,
        description: s.description,
        collectedAt: new Date(s.collectedAt),
        customFields: (s.customFields as any) ?? undefined,
      },
    });
  }

  for (const p of backup.samplePhotos) {
    await prisma.samplePhoto.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        sampleId: p.sampleId,
        url: p.url,
        meta: (p.meta as any) ?? undefined,
        createdAt: new Date(p.createdAt),
      },
      update: {
        sampleId: p.sampleId,
        url: p.url,
        meta: (p.meta as any) ?? undefined,
      },
    });
  }

  for (const m of backup.media) {
    await prisma.media.upsert({
      where: { id: m.id },
      create: {
        id: m.id,
        name: m.name,
        composition: m.composition,
        createdAt: new Date(m.createdAt),
      },
      update: {
        name: m.name,
        composition: m.composition,
      },
    });
  }

  for (const b of backup.storageBoxes) {
    await prisma.storageBox.upsert({
      where: { id: b.id },
      create: {
        id: b.id,
        displayName: b.displayName,
        rows: b.rows,
        cols: b.cols,
        description: b.description,
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt),
      },
      update: {
        displayName: b.displayName,
        rows: b.rows,
        cols: b.cols,
        description: b.description,
      },
    });
  }

  for (const c of backup.storageCells) {
    await prisma.storageCell.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        boxId: c.boxId,
        row: c.row,
        col: c.col,
        cellCode: c.cellCode,
        status: c.status,
      },
      update: {
        boxId: c.boxId,
        row: c.row,
        col: c.col,
        cellCode: c.cellCode,
        status: c.status,
      },
    });
  }

  for (const s of backup.strains) {
    await prisma.strain.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        identifier: s.identifier,
        sampleId: s.sampleId,
        taxonomy16s: s.taxonomy16s,
        otherTaxonomy: s.otherTaxonomy,
        indexerInitials: s.indexerInitials,
        collectionRcam: s.collectionRcam,
        isolationRegion: s.isolationRegion as any,
        features: s.features,
        comments: s.comments,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        customFields: (s.customFields as any) ?? undefined,
      },
      update: {
        identifier: s.identifier,
        sampleId: s.sampleId,
        taxonomy16s: s.taxonomy16s,
        otherTaxonomy: s.otherTaxonomy,
        indexerInitials: s.indexerInitials,
        collectionRcam: s.collectionRcam,
        isolationRegion: s.isolationRegion as any,
        features: s.features,
        comments: s.comments,
        customFields: (s.customFields as any) ?? undefined,
      },
    });
  }

  for (const p of backup.strainPhotos) {
    await prisma.strainPhoto.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        strainId: p.strainId,
        url: p.url,
        meta: (p.meta as any) ?? undefined,
        createdAt: new Date(p.createdAt),
      },
      update: {
        strainId: p.strainId,
        url: p.url,
        meta: (p.meta as any) ?? undefined,
      },
    });
  }

  for (const sm of backup.strainMedia) {
    await prisma.strainMedia.upsert({
      where: { strainId_mediaId: { strainId: sm.strainId, mediaId: sm.mediaId } },
      create: {
        strainId: sm.strainId,
        mediaId: sm.mediaId,
        notes: sm.notes,
      },
      update: { notes: sm.notes },
    });
  }

  for (const ss of backup.strainStorage) {
    await prisma.strainStorage.upsert({
      where: { id: ss.id },
      create: {
        id: ss.id,
        strainId: ss.strainId,
        cellId: ss.cellId,
        isPrimary: ss.isPrimary,
        allocatedAt: new Date(ss.allocatedAt),
      },
      update: {
        strainId: ss.strainId,
        cellId: ss.cellId,
        isPrimary: ss.isPrimary,
      },
    });
  }

  // Keep StorageCell status consistent with allocations
  const allocatedCellIds = backup.strainStorage.map((s) => s.cellId);
  if (allocatedCellIds.length) {
    await prisma.storageCell.updateMany({
      where: { id: { in: allocatedCellIds } },
      data: { status: 'OCCUPIED' },
    });
  }

  if (backup.legendContent) {
    const legend = Array.isArray(backup.legendContent)
      ? backup.legendContent[0]
      : backup.legendContent;

    if (legend?.id && typeof legend.content === 'string') {
    await prisma.legendContent.upsert({
      where: { id: legend.id },
      create: {
        id: legend.id,
        content: legend.content,
      },
      update: { content: legend.content },
    });
    }
  }

  for (const ub of backup.uiBindings) {
    await prisma.uiBinding.upsert({
      where: { id: ub.id },
      create: {
        id: ub.id,
        menuLabel: ub.menuLabel,
        profileKey: ub.profileKey,
        order: ub.order,
        legendId: ub.legendId,
        routeSlug: ub.routeSlug,
        icon: ub.icon ?? undefined,
        enabledFieldPacks: (ub.enabledFieldPacks as any) ?? [],
        updatedAt: new Date(ub.updatedAt),
      },
      update: {
        menuLabel: ub.menuLabel,
        profileKey: ub.profileKey,
        order: ub.order,
        legendId: ub.legendId,
        routeSlug: ub.routeSlug,
        icon: ub.icon ?? undefined,
        enabledFieldPacks: (ub.enabledFieldPacks as any) ?? [],
      },
    });
  }

  // Rebuild phenotypes from legacy strain columns.
  const strainIds = backup.strains.map((s) => s.id);
  await prisma.strainPhenotype.deleteMany({
    where: {
      strainId: { in: strainIds },
      OR: [
        { traitDefinitionId: { in: Array.from(traitMap.values()).map((t) => t.id) } },
        {
          traitName: {
            in: [
              'Gram Stain',
              'Amylase',
              'IUK / IAA',
              'Antibiotic Activity',
              'Sequenced (SEQ)',
              'Phosphate Solubilization',
              'Siderophore Production',
              'Pigment Secretion',
              'Pigment Production',
            ],
          },
        },
      ],
    },
  });

  const phenotypeCreates: Array<{
    strainId: number;
    traitDefinitionId: number | null;
    traitName: string | null;
    result: string;
    method?: string | null;
  }> = [];

  const pushPhenotype = (strainId: number, code: string, result: string, method?: string | null) => {
    const t = traitMap.get(code);
    if (!t) throw new Error(`Missing traitDefinition for code=${code}`);
    phenotypeCreates.push({
      strainId,
      traitDefinitionId: t.id,
      traitName: t.name,
      result,
      method: method ?? null,
    });
  };

  for (const s of backup.strains) {
    const gram = mapPosNeg(s.gramStain);
    if (gram) pushPhenotype(s.id, 'gram_stain', gram);

    const amyl = mapPosNeg(s.amylase);
    if (amyl === '+' || amyl === '-') pushPhenotype(s.id, 'amylase', amyl);

    const iuk = trimOrNull(s.iuk);
    if (iuk) pushPhenotype(s.id, 'iuk_iaa', iuk);

    const aa = trimOrNull(s.antibioticActivity);
    if (aa) pushPhenotype(s.id, 'antibiotic_activity', aa);

    if (s.seq) pushPhenotype(s.id, 'sequenced_seq', 'true');
    if (s.phosphates) pushPhenotype(s.id, 'phosphate_solubilization', 'true');
    if (s.siderophores) pushPhenotype(s.id, 'siderophore_production', 'true');
    if (s.pigmentSecretion) pushPhenotype(s.id, 'pigment_secretion', 'true');
  }

  if (phenotypeCreates.length) {
    await prisma.strainPhenotype.createMany({
      data: phenotypeCreates,
      skipDuplicates: false,
    });
  }

  await resetSequences();

  console.log(`Imported phenotypes: ${phenotypeCreates.length}`);
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
