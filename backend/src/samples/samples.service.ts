import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SampleType } from '@prisma/client';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleQueryDto } from './dto/sample-query.dto';
import { ImageKitService } from '../services/imagekit.service';
import {
  buildSummary,
  formatImportError,
  ImportReport,
  ImportRowError,
  ImportRowResult,
  parseCsvBuffer,
  parseOptionalDate,
  parseOptionalNumber,
} from '../common/csv-import';

/**
 * Optional fields use the convention:
 *   - key absent (undefined) → CSV had no such column → don't touch on update
 *   - key present with `null` → CSV column was empty → clear in DB
 *   - key present with value → CSV column had value → set in DB
 *
 * Required fields (`sampleTypeId`, `siteName`, `collectedAt`) are always
 * present; `code` is optional but, when present, drives the upsert key.
 */
interface PreparedSampleData {
  code?: string;
  sampleTypeId: number;
  sampleTypeSlug: string;
  subject?: string | null;
  siteName: string;
  lat?: number | null;
  lng?: number | null;
  description?: string | null;
  collectedAt: Date;
}

interface PreparedSampleRow {
  rowNum: number;
  identifier?: string;
  errors: ImportRowError[];
  data: PreparedSampleData | null;
}

@Injectable()
export class SamplesService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private imagekitService: ImageKitService,
  ) {}

  async onModuleInit() {
    const defaults = [
      { name: 'Plant', slug: 'plant' },
      { name: 'Animal', slug: 'animal' },
      { name: 'Water', slug: 'water' },
      { name: 'Soil', slug: 'soil' },
      { name: 'Other', slug: 'other' },
    ];

    await this.prisma.$transaction(
      defaults.map((type) =>
        this.prisma.sampleTypeDictionary.upsert({
          where: { slug: type.slug },
          update: {},
          create: type,
        }),
      ),
    );
  }

  private buildSubjectSlug(subject?: string | null) {
    const trimmed = typeof subject === 'string' ? subject.trim() : '';
    return trimmed ? trimmed.replace(/\s+/g, '-') : 'NoSubject';
  }

  private buildDisplayBase(sampleTypeSlug: string, subject?: string | null) {
    return `${sampleTypeSlug}_${this.buildSubjectSlug(subject)}`;
  }

  private parseDisplaySuffix(display: string, base: string) {
    if (display === base) return 0;
    if (!display.startsWith(`${base}-`)) return null;
    const raw = display.slice(base.length + 1);
    if (!/^\d+$/.test(raw)) return null;
    return Number.parseInt(raw, 10);
  }

  private async reserveDisplayCode(
    tx: Prisma.TransactionClient,
    sampleTypeId: number,
    base: string,
    excludeId?: number,
  ) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${base}))`;

    const candidates = await tx.sample.findMany({
      where: {
        sampleTypeId,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
        code: { contains: `_${base}` },
      },
      select: { code: true },
    });

    let maxSuffix = -1;
    for (const candidate of candidates) {
      const display = candidate.code.replace(/^\d+_/, '');
      const suffix = this.parseDisplaySuffix(display, base);
      if (suffix !== null && suffix > maxSuffix) {
        maxSuffix = suffix;
      }
    }

    const nextSuffix = maxSuffix + 1;
    return nextSuffix <= 0 ? base : `${base}-${nextSuffix}`;
  }

  private buildSamplesWhere(query: SampleQueryDto): Prisma.SampleWhereInput {
    const {
      sampleType,
      sampleTypeId,
      subject,
      search,
      dateFrom,
      dateTo,
      site,
      latMin,
      latMax,
      lngMin,
      lngMax,
    } = query;

    const where: Prisma.SampleWhereInput = {};

    if (sampleType) where.sampleType = sampleType;

    if (dateFrom || dateTo) {
      const collectedAtFilter: { gte?: Date; lte?: Date } = {};
      if (dateFrom) {
        collectedAtFilter.gte = new Date(dateFrom);
      }
      if (dateTo) {
        collectedAtFilter.lte = new Date(dateTo);
      }
      where.collectedAt = collectedAtFilter as unknown as Prisma.DateTimeFilter;
    }

    if (site) {
      where.siteName = { contains: site, mode: 'insensitive' };
    }

    if (latMin !== undefined || latMax !== undefined) {
      const latFilter: { gte?: number; lte?: number } = {};
      if (latMin !== undefined) latFilter.gte = latMin;
      if (latMax !== undefined) latFilter.lte = latMax;
      where.lat = latFilter as unknown as Prisma.FloatNullableFilter;
    }

    if (lngMin !== undefined || lngMax !== undefined) {
      const lngFilter: { gte?: number; lte?: number } = {};
      if (lngMin !== undefined) lngFilter.gte = lngMin;
      if (lngMax !== undefined) lngFilter.lte = lngMax;
      where.lng = lngFilter as unknown as Prisma.FloatNullableFilter;
    }

    if (sampleTypeId !== undefined) {
      where.sampleTypeId = sampleTypeId;
    }

    if (subject) {
      where.subject = { contains: subject, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { siteName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private buildSamplesOrderBy(
    query: SampleQueryDto,
  ): Prisma.SampleOrderByWithRelationInput {
    const { sortBy = 'createdAt', sortOrder = 'desc' } = query;
    return { [sortBy]: sortOrder } as Prisma.SampleOrderByWithRelationInput;
  }

  async findAll(query: SampleQueryDto) {
    const { page = 1, limit = 50 } = query;
    const where = this.buildSamplesWhere(query);
    const orderBy = this.buildSamplesOrderBy(query);

    const [samples, total] = await Promise.all([
      this.prisma.sample.findMany({
        where,
        include: {
          _count: {
            select: { strains: true, photos: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.sample.count({ where }),
    ]);

    return {
      data: samples,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllForExport(query: SampleQueryDto) {
    const where = this.buildSamplesWhere(query);
    const orderBy = this.buildSamplesOrderBy(query);

    const samples = await this.prisma.sample.findMany({
      where,
      include: {
        strains: {
          select: { id: true, identifier: true },
          orderBy: { identifier: 'asc' },
        },
        photos: {
          select: { id: true, url: true, meta: true },
          orderBy: { id: 'asc' },
        },
        _count: {
          select: { strains: true, photos: true },
        },
      },
      orderBy,
    });

    return { data: samples };
  }

  async findOne(id: number) {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
      include: {
        strains: {
          select: {
            id: true,
            identifier: true,
            // legacy fields removed: seq, gramStain
            phenotypes: true,
          },
        },
        photos: true,
      },
    });

    if (!sample) {
      throw new NotFoundException(`Sample with ID ${id} not found`);
    }

    return sample;
  }

  async create(createSampleDto: CreateSampleDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch Sample Type to get the slug
      const sampleType = await tx.sampleTypeDictionary.findUnique({
        where: { id: createSampleDto.sampleTypeId },
      });

      if (!sampleType) {
        throw new NotFoundException(
          `Sample Type with ID ${createSampleDto.sampleTypeId} not found`,
        );
      }

      const base = this.buildDisplayBase(
        sampleType.slug,
        createSampleDto.subject,
      );
      const displayCode = await this.reserveDisplayCode(
        tx,
        sampleType.id,
        base,
      );

      // 2. Create Sample with a temporary code
      // We use a random string to satisfy the unique constraint temporarily
      const tempCode = `TEMP_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const sample = await tx.sample.create({
        data: {
          ...createSampleDto,
          code: tempCode,
          sampleType: sampleType.slug.toUpperCase() as SampleType,
          collectedAt: new Date(createSampleDto.collectedAt),
        },
      });

      // 3. Generate the final code based on ID
      // Format: ID_DISPLAY (display = type + subject + optional suffix)
      const finalCode = `${sample.id}_${displayCode}`;

      // 4. Update the sample with the final code
      return tx.sample.update({
        where: { id: sample.id },
        data: { code: finalCode },
        include: {
          photos: {
            select: { id: true },
          },
        },
      });
    });
  }

  async update(id: number, updateSampleDto: UpdateSampleDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.sample.findUnique({
        where: { id },
        select: { sampleTypeId: true, subject: true },
      });
      if (!existing) {
        throw new NotFoundException(`Sample with ID ${id} not found`);
      }

      const data: Prisma.SampleUpdateInput = { ...updateSampleDto };
      if (updateSampleDto.collectedAt) {
        data.collectedAt = new Date(updateSampleDto.collectedAt);
      }

      let sampleTypeId = existing.sampleTypeId ?? undefined;
      let sampleTypeSlug: string | null = null;

      if (updateSampleDto.sampleTypeId !== undefined) {
        const sampleType = await tx.sampleTypeDictionary.findUnique({
          where: { id: updateSampleDto.sampleTypeId },
        });
        if (!sampleType) {
          throw new NotFoundException(
            `Sample Type with ID ${updateSampleDto.sampleTypeId} not found`,
          );
        }
        sampleTypeId = sampleType.id;
        sampleTypeSlug = sampleType.slug;
        data.sampleType = sampleType.slug.toUpperCase() as SampleType;
      } else if (sampleTypeId) {
        const sampleType = await tx.sampleTypeDictionary.findUnique({
          where: { id: sampleTypeId },
        });
        if (sampleType) {
          sampleTypeSlug = sampleType.slug;
        }
      }

      const shouldRebuildCode =
        updateSampleDto.subject !== undefined ||
        updateSampleDto.sampleTypeId !== undefined;

      if (shouldRebuildCode) {
        if (!sampleTypeId || !sampleTypeSlug) {
          throw new NotFoundException(
            `Sample Type for Sample ${id} not found`,
          );
        }

        const nextSubject =
          updateSampleDto.subject !== undefined
            ? updateSampleDto.subject
            : existing.subject;
        const base = this.buildDisplayBase(sampleTypeSlug, nextSubject);
        const displayCode = await this.reserveDisplayCode(
          tx,
          sampleTypeId,
          base,
          id,
        );
        data.code = `${id}_${displayCode}`;
      }

      return tx.sample.update({
        where: { id },
        data,
      });
    });
  }

  async remove(id: number) {
    const sample = await this.prisma.sample.findUnique({ where: { id } });
    if (!sample) {
      throw new NotFoundException(`Sample with ID ${id} not found`);
    }
    return this.prisma.sample.delete({ where: { id } });
  }

  async uploadPhoto(sampleId: number, file: Express.Multer.File) {
    // Verify sample exists
    const sample = await this.prisma.sample.findUnique({
      where: { id: sampleId },
    });
    if (!sample) {
      throw new NotFoundException(`Sample with ID ${sampleId} not found`);
    }

    // Upload to ImageKit
    const uploadResponse = await this.imagekitService.uploadImage(
      file.buffer,
      file.originalname,
      'sample-photos',
    );

    // Save metadata to database
    return this.prisma.samplePhoto.create({
      data: {
        sampleId,
        url: uploadResponse.url,
        meta: {
          fileId: uploadResponse.fileId,
          originalName: file.originalname,
          size: uploadResponse.size,
          width: uploadResponse.width,
          height: uploadResponse.height,
          fileType: uploadResponse.fileType,
        },
      },
    });
  }

  async deletePhoto(photoId: number) {
    const photo = await this.prisma.samplePhoto.findUnique({
      where: { id: photoId },
    });
    if (!photo) {
      throw new NotFoundException(`Photo with ID ${photoId} not found`);
    }

    // Extract fileId from meta
    const meta = photo.meta as { fileId?: string } | null;
    if (typeof meta?.fileId === 'string') {
      try {
        await this.imagekitService.deleteImage(meta.fileId);
      } catch (error) {
        console.error('Failed to delete from ImageKit:', error);
        // Continue with database deletion even if ImageKit deletion fails
      }
    }

    // Delete from database
    return this.prisma.samplePhoto.delete({ where: { id: photoId } });
  }

  async getSampleTypes() {
    return this.prisma.sampleTypeDictionary.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /* ----------------------------------------------------------------- */
  /*  CSV import                                                        */
  /* ----------------------------------------------------------------- */

  /**
   * Validate and normalise a single CSV row against the Sample schema.
   * Pure function — does not touch the database; returns errors instead
   * of throwing so the caller can collect them per-row.
   */
  private async validateSampleRow(
    raw: Record<string, string>,
    rowNum: number,
    sampleTypeIndex: Map<string, { id: number; slug: string }>,
    headerSet: Set<string>,
  ): Promise<PreparedSampleRow> {
    const errors: ImportRowError[] = [];
    const code = (raw['Code'] ?? '').trim() || undefined;
    const identifier = code;

    const sampleTypeInput = (raw['Sample Type'] ?? '').trim();
    let sampleTypeRecord: { id: number; slug: string } | undefined;
    if (!sampleTypeInput) {
      errors.push({ field: 'Sample Type', message: 'Required' });
    } else {
      sampleTypeRecord = sampleTypeIndex.get(sampleTypeInput.toLowerCase());
      if (!sampleTypeRecord) {
        errors.push({
          field: 'Sample Type',
          message: `Unknown sample type "${sampleTypeInput}"`,
        });
      }
    }

    const siteName = (raw['Site Name'] ?? '').trim();
    if (!siteName) {
      errors.push({ field: 'Site Name', message: 'Required' });
    }

    const collectedAtRaw = (raw['Collected At'] ?? '').trim();
    const collectedAt = parseOptionalDate(collectedAtRaw);
    if (!collectedAtRaw) {
      errors.push({ field: 'Collected At', message: 'Required' });
    } else if (collectedAt === null) {
      errors.push({
        field: 'Collected At',
        message: `Invalid date "${collectedAtRaw}"`,
      });
    }

    // Optional numeric fields with absence-vs-empty distinction.
    let lat: number | null | undefined;
    if (headerSet.has('Latitude')) {
      const v = (raw['Latitude'] ?? '').trim();
      if (!v) {
        lat = null;
      } else {
        const parsed = parseOptionalNumber(v);
        if (parsed === null) {
          errors.push({ field: 'Latitude', message: `Invalid number "${v}"` });
          lat = null;
        } else if (parsed !== undefined && (parsed < -90 || parsed > 90)) {
          errors.push({ field: 'Latitude', message: 'Out of range (-90..90)' });
          lat = null;
        } else {
          lat = parsed ?? null;
        }
      }
    }

    let lng: number | null | undefined;
    if (headerSet.has('Longitude')) {
      const v = (raw['Longitude'] ?? '').trim();
      if (!v) {
        lng = null;
      } else {
        const parsed = parseOptionalNumber(v);
        if (parsed === null) {
          errors.push({
            field: 'Longitude',
            message: `Invalid number "${v}"`,
          });
          lng = null;
        } else if (
          parsed !== undefined &&
          (parsed < -180 || parsed > 180)
        ) {
          errors.push({
            field: 'Longitude',
            message: 'Out of range (-180..180)',
          });
          lng = null;
        } else {
          lng = parsed ?? null;
        }
      }
    }

    if (errors.length > 0 || !sampleTypeRecord || !collectedAt) {
      return { rowNum, identifier, errors, data: null };
    }

    const data: PreparedSampleData = {
      code,
      sampleTypeId: sampleTypeRecord.id,
      sampleTypeSlug: sampleTypeRecord.slug,
      siteName,
      collectedAt,
    };

    // Conditional spread for absence-aware optional fields.
    if (headerSet.has('Subject')) {
      const v = (raw['Subject'] ?? '').trim();
      data.subject = v || null;
    }
    if (lat !== undefined) data.lat = lat;
    if (lng !== undefined) data.lng = lng;
    if (headerSet.has('Description')) {
      const v = (raw['Description'] ?? '').trim();
      data.description = v || null;
    }

    return {
      rowNum,
      identifier,
      errors: [],
      data,
    };
  }

  private async loadSampleTypeIndex(): Promise<
    Map<string, { id: number; slug: string }>
  > {
    const types = await this.prisma.sampleTypeDictionary.findMany({
      select: { id: true, slug: true, name: true },
    });
    const index = new Map<string, { id: number; slug: string }>();
    // Index by slug, name, and uppercase enum form so users can paste
    // either format the export produces or what they see in the UI.
    for (const t of types) {
      index.set(t.slug.toLowerCase(), { id: t.id, slug: t.slug });
      index.set(t.name.toLowerCase(), { id: t.id, slug: t.slug });
      index.set(t.slug.toUpperCase().toLowerCase(), {
        id: t.id,
        slug: t.slug,
      });
    }
    return index;
  }

  private async prepareSamplesImport(
    buffer: Buffer,
  ): Promise<PreparedSampleRow[]> {
    const { headers, rows } = parseCsvBuffer(buffer);
    const headerSet = new Set(headers);
    const sampleTypeIndex = await this.loadSampleTypeIndex();
    return Promise.all(
      rows.map((row, idx) =>
        this.validateSampleRow(row, idx + 1, sampleTypeIndex, headerSet),
      ),
    );
  }

  async dryRunSamplesImport(buffer: Buffer): Promise<ImportReport> {
    const prepared = await this.prepareSamplesImport(buffer);

    // Resolve which codes already exist to differentiate create vs update
    const codes = prepared
      .map((p) => p.data?.code)
      .filter((c): c is string => Boolean(c));
    const existing = codes.length
      ? await this.prisma.sample.findMany({
          where: { code: { in: codes } },
          select: { code: true },
        })
      : [];
    const existingCodes = new Set(existing.map((e) => e.code));

    const result: ImportRowResult[] = prepared.map((r) => {
      if (r.errors.length > 0 || !r.data) {
        return {
          rowNum: r.rowNum,
          identifier: r.identifier,
          status: 'error',
          errors: r.errors,
        };
      }
      const isUpdate = r.data.code ? existingCodes.has(r.data.code) : false;
      return {
        rowNum: r.rowNum,
        identifier: r.identifier ?? r.data.code,
        status: isUpdate ? 'update' : 'create',
        errors: [],
      };
    });

    return { summary: buildSummary(result), rows: result };
  }

  async commitSamplesImport(buffer: Buffer): Promise<ImportReport> {
    const prepared = await this.prepareSamplesImport(buffer);
    const result: ImportRowResult[] = [];

    for (const r of prepared) {
      if (r.errors.length > 0 || !r.data) {
        result.push({
          rowNum: r.rowNum,
          identifier: r.identifier,
          status: 'error',
          errors: r.errors,
        });
        continue;
      }

      try {
        const wasUpdate = await this.applySampleImportRow(r.data);
        result.push({
          rowNum: r.rowNum,
          identifier: r.identifier ?? r.data.code,
          status: wasUpdate ? 'update' : 'create',
          errors: [],
        });
      } catch (err) {
        console.error(
          `[samples-import] row ${r.rowNum} (${r.identifier}) failed:`,
          err,
        );
        result.push({
          rowNum: r.rowNum,
          identifier: r.identifier,
          status: 'error',
          errors: [{ message: formatImportError(err) }],
        });
      }
    }

    return { summary: buildSummary(result), rows: result };
  }

  /**
   * Apply a single validated row inside its own transaction. Returns true
   * if the existing record was updated, false if a new one was created.
   * Errors propagate; the caller wraps them in row-level error reports.
   *
   * Idempotency rules:
   *  - If `code` is present in CSV and matches an existing record → update.
   *  - If `code` is present but does NOT match → create the new record
   *    with that exact code preserved (round-trip into another database
   *    works, repeat-import is a no-op on the second pass).
   *  - If `code` is absent → fall through to canonical code generation.
   *
   * Code uniqueness is enforced by the DB; if a foreign code happens to
   * collide with an unrelated record, Prisma raises P2002 which the
   * row-level error handler surfaces verbatim.
   */
  private async applySampleImportRow(
    data: PreparedSampleData,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const existing = data.code
        ? await tx.sample.findUnique({
            where: { code: data.code },
            select: { id: true },
          })
        : null;

      if (existing) {
        // Build update payload from required fields plus only the optional
        // fields whose CSV columns were actually present. Absent columns
        // stay out of the payload so Prisma leaves them untouched.
        // Use UncheckedUpdateInput so we can set the raw `sampleTypeId`
        // FK alongside the enum `sampleType`, mirroring the existing
        // controller-level `update()` flow.
        const updateData: Prisma.SampleUncheckedUpdateInput = {
          sampleTypeId: data.sampleTypeId,
          sampleType: data.sampleTypeSlug.toUpperCase() as SampleType,
          siteName: data.siteName,
          collectedAt: data.collectedAt,
        };
        if ('subject' in data) updateData.subject = data.subject;
        if ('lat' in data) updateData.lat = data.lat;
        if ('lng' in data) updateData.lng = data.lng;
        if ('description' in data) updateData.description = data.description;

        await tx.sample.update({
          where: { id: existing.id },
          data: updateData,
        });
        return true;
      }

      // Preserve provided code on create — required for export/import
      // round-trip and for re-import idempotency.
      if (data.code) {
        await tx.sample.create({
          data: {
            code: data.code,
            sampleTypeId: data.sampleTypeId,
            sampleType: data.sampleTypeSlug.toUpperCase() as SampleType,
            subject: data.subject,
            siteName: data.siteName,
            lat: data.lat,
            lng: data.lng,
            description: data.description,
            collectedAt: data.collectedAt,
          },
        });
        return false;
      }

      // No code in CSV — generate canonical `${id}_${displayCode}` via the
      // existing reservation logic. Two-step (temp code → final code) is
      // the same dance that `create()` does for fresh records.
      const base = this.buildDisplayBase(data.sampleTypeSlug, data.subject);
      const displayCode = await this.reserveDisplayCode(
        tx,
        data.sampleTypeId,
        base,
      );
      const tempCode = `TEMP_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;
      const created = await tx.sample.create({
        data: {
          code: tempCode,
          sampleTypeId: data.sampleTypeId,
          sampleType: data.sampleTypeSlug.toUpperCase() as SampleType,
          subject: data.subject,
          siteName: data.siteName,
          lat: data.lat,
          lng: data.lng,
          description: data.description,
          collectedAt: data.collectedAt,
        },
      });
      await tx.sample.update({
        where: { id: created.id },
        data: { code: `${created.id}_${displayCode}` },
      });
      return false;
    });
  }
}
