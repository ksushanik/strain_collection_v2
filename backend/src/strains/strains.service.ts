import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CellStatus, Prisma } from '@prisma/client';
import { CreateStrainDto } from './dto/create-strain.dto';
import { UpdateStrainDto } from './dto/update-strain.dto';
import { StrainQueryDto } from './dto/strain-query.dto';
import { CreateStrainPhenotypeDto } from './dto/create-strain-phenotype.dto';
import { ImageKitService } from '../services/imagekit.service';
import { TAXONOMY_RULES, TaxonomyRule } from './taxonomy.rules';
import {
  buildSummary,
  formatImportError,
  ImportReport,
  ImportRowError,
  ImportRowResult,
  parseCsvBuffer,
  parseOptionalNumber,
  parsePhenotypesColumn,
} from '../common/csv-import';

const ISOLATION_REGION_VALUES = [
  'RHIZOSPHERE',
  'ENDOSPHERE',
  'PHYLLOSPHERE',
  'SOIL',
  'OTHER',
] as const;
type IsolationRegionEnum = (typeof ISOLATION_REGION_VALUES)[number];

const BIOSAFETY_LEVEL_VALUES = ['BSL_1', 'BSL_2', 'BSL_3', 'BSL_4'] as const;
type BiosafetyLevelEnum = (typeof BIOSAFETY_LEVEL_VALUES)[number];

const STOCK_TYPE_VALUES = ['MASTER', 'WORKING', 'DISTRIBUTION'] as const;
type StockTypeEnum = (typeof STOCK_TYPE_VALUES)[number];

const WGS_STATUS_VALUES = [
  'NONE',
  'PLANNED',
  'SEQUENCED',
  'ASSEMBLED',
  'PUBLISHED',
] as const;
type WgsStatusEnum = (typeof WGS_STATUS_VALUES)[number];

interface PreparedStrainPhenotype {
  traitDefinitionId: number;
  traitName: string;
  result: string;
  method?: string;
}

interface PreparedStrainGenetics {
  wgsStatus?: WgsStatusEnum;
  assemblyAccession?: string;
  marker16sAccession?: string;
  marker16sSequence?: string;
}

/**
 * Optional fields use the convention:
 *   - key absent (undefined)        → CSV had no such column → don't touch
 *   - key present with `null`       → CSV column was empty   → clear in DB
 *   - key present with value        → CSV column had value   → set in DB
 *
 * Required fields (`identifier`, `sampleId`) are always present.
 * `phenotypes`/`genetics` use the same absence-vs-empty convention via
 * optional `?` modifier; commit code checks `data.phenotypes !== undefined`.
 */
interface PreparedStrainData {
  identifier: string;
  sampleId: number;
  ncbiScientificName?: string | null;
  ncbiTaxonomyId?: number | null;
  biosafetyLevel?: BiosafetyLevelEnum | null;
  stockType?: StockTypeEnum | null;
  passageNumber?: number | null;
  taxonomy16s?: string | null;
  otherTaxonomy?: string | null;
  collectionRcam?: string | null;
  indexerInitials?: string | null;
  isolationRegion?: IsolationRegionEnum | null;
  features?: string | null;
  comments?: string | null;
  phenotypes?: PreparedStrainPhenotype[];
  genetics?: PreparedStrainGenetics;
}

interface PreparedStrainRow {
  rowNum: number;
  identifier?: string;
  errors: ImportRowError[];
  data: PreparedStrainData | null;
}

@Injectable()
export class StrainsService {
  private gramStainTraitCache?: { id: number; name: string } | null;

  constructor(
    private prisma: PrismaService,
    private imagekitService: ImageKitService,
  ) {}

  private buildStrainsWhere(query: StrainQueryDto): Prisma.StrainWhereInput {
    const {
      sampleId,
      sampleCode,
      hasGenome,
      taxonomy,
      gramStain,
      amylase,
      phosphateSolubilization,
      siderophoreProduction,
      pigmentSecretion,
      search,
      isolationRegion,
    } = query;

    const where: Prisma.StrainWhereInput = {};
    const andFilters: Prisma.StrainWhereInput[] = [];

    if (sampleId !== undefined) where.sampleId = sampleId;
    if (isolationRegion) where.isolationRegion = isolationRegion;
    if (hasGenome !== undefined) {
      // Check StrainGenetics
      where.genetics = hasGenome ? { isNot: null } : null;
    }
    if (taxonomy) {
      andFilters.push({
        OR: [
          { taxonomy16s: { contains: taxonomy, mode: 'insensitive' } },
          { ncbiScientificName: { contains: taxonomy, mode: 'insensitive' } },
        ],
      });
    }
    if (sampleCode) {
      where.sample = {
        is: { code: { contains: sampleCode, mode: 'insensitive' } },
      };
    }

    if (search) {
      andFilters.push({
        OR: [
          { identifier: { contains: search, mode: 'insensitive' } },
          { features: { contains: search, mode: 'insensitive' } },
          { comments: { contains: search, mode: 'insensitive' } },
          { ncbiScientificName: { contains: search, mode: 'insensitive' } },
          { taxonomy16s: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (gramStain) {
      andFilters.push(
        this.buildTraitFilter(
          'gram_stain',
          ['Gram Stain'],
          gramStain === 'positive',
        ),
      );
    }

    if (amylase !== undefined) {
      andFilters.push(
        this.buildTraitFilter('amylase', ['Amylase'], amylase),
      );
    }

    if (phosphateSolubilization !== undefined) {
      andFilters.push(
        this.buildTraitFilter(
          'phosphate_solubilization',
          ['Phosphate Solubilization'],
          phosphateSolubilization,
        ),
      );
    }

    if (siderophoreProduction !== undefined) {
      andFilters.push(
        this.buildTraitFilter(
          'siderophore_production',
          ['Siderophore Production'],
          siderophoreProduction,
        ),
      );
    }

    if (pigmentSecretion !== undefined) {
      andFilters.push(
        this.buildTraitFilter(
          'pigment_secretion',
          ['Pigment Secretion', 'Pigment Production'],
          pigmentSecretion,
        ),
      );
    }

    if (andFilters.length > 0) {
      const existingAnd = Array.isArray(where.AND)
        ? where.AND
        : where.AND
          ? [where.AND]
          : [];
      where.AND = [...existingAnd, ...andFilters];
    }

    return where;
  }

  private buildStrainsOrderBy(
    query: StrainQueryDto,
  ): Prisma.StrainOrderByWithRelationInput {
    const { sortBy = 'createdAt', sortOrder = 'desc' } = query;
    return sortBy === 'sampleCode'
      ? { sample: { code: sortOrder } }
      : ({ [sortBy]: sortOrder } as Prisma.StrainOrderByWithRelationInput);
  }

  async findAll(query: StrainQueryDto) {
    const { page = 1, limit = 50 } = query;
    const where = this.buildStrainsWhere(query);
    const orderBy = this.buildStrainsOrderBy(query);

    const [strains, total] = await Promise.all([
      this.prisma.strain.findMany({
        where,
        include: {
          sample: {
            select: { id: true, code: true, siteName: true },
          },
          phenotypes: {
            where: {
              traitDefinition: {
                code: {
                  in: [
                    'gram_stain',
                    'amylase',
                    'phosphate_solubilization',
                    'siderophore_production',
                    'pigment_secretion',
                  ],
                },
              },
            },
            select: {
              result: true,
              traitName: true,
              traitDefinition: {
                select: { code: true, name: true, dataType: true },
              },
            },
          },
          storage: {
            orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
            select: {
              id: true,
              isPrimary: true,
              cell: {
                select: {
                  id: true,
                  cellCode: true,
                  box: {
                    select: {
                      id: true,
                      displayName: true,
                    },
                  },
                },
              },
            },
          },
          photos: {
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
            take: 1,
            select: {
              id: true,
              strainId: true,
              url: true,
              meta: true,
              createdAt: true,
              isPrimary: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.strain.count({ where }),
    ]);

    return {
      data: strains.map((s) => {
        const gram = s.phenotypes?.find(
          (p) => p.traitDefinition?.code === 'gram_stain',
        );
        return {
          ...s,
          gramStainLabel: gram?.result || null,
        };
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllForExport(query: StrainQueryDto) {
    const where = this.buildStrainsWhere(query);
    const orderBy = this.buildStrainsOrderBy(query);

    const strains = await this.prisma.strain.findMany({
      where,
      include: {
        sample: true,
        phenotypes: {
          include: {
            traitDefinition: {
              select: {
                code: true,
                name: true,
                dataType: true,
                units: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
        genetics: true,
        storage: {
          orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
          include: {
            cell: {
              include: {
                box: { select: { id: true, displayName: true } },
              },
            },
          },
        },
        media: {
          include: {
            media: { select: { id: true, name: true } },
          },
        },
        photos: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            url: true,
            meta: true,
            isPrimary: true,
          },
        },
      },
      orderBy,
    });

    return {
      data: strains.map((s) => {
        const gram = s.phenotypes?.find(
          (p) => p.traitDefinition?.code === 'gram_stain',
        );
        return {
          ...s,
          gramStainLabel: gram?.result || null,
        };
      }),
    };
  }

  async findOne(id: number) {
    const strain = await this.prisma.strain.findUnique({
      where: { id },
      include: {
        sample: true,
        media: {
          include: {
            media: true,
          },
        },
        storage: {
          include: {
            cell: {
              include: {
                box: true,
              },
            },
          },
        },
        photos: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
        },
        phenotypes: {
          include: {
            traitDefinition: true,
          },
        },
        genetics: true,
      },
    });

    if (!strain) {
      throw new NotFoundException(`Strain with ID ${id} not found`);
    }

    return strain;
  }

  async create(createStrainDto: CreateStrainDto) {
    await this.validateTaxonomy(createStrainDto);
    const {
      phenotypes: initialPhenotypes,
      genetics,
      ...strainData
    } = createStrainDto;
    let phenotypes = initialPhenotypes;

    // Auto-enrich based on taxonomy if needed
    const rule = this.getTaxonomyRule(createStrainDto.ncbiScientificName);
    if (rule?.autoGramStain) {
      const gramTrait = await this.getGramStainTrait();

      // Check if Gram Stain is already provided in phenotypes
      const hasGramStain = !!this.findGramStainPhenotype(
        phenotypes,
        gramTrait?.id,
      );
      if (!hasGramStain) {
        phenotypes = phenotypes || [];
        phenotypes.push({
          traitDefinitionId: gramTrait?.id,
          traitName: gramTrait?.name ?? 'Gram Stain',
          result: '-',
          method: 'Taxonomy Rule (Auto)',
        });
      }
    }

    return this.prisma.strain.create({
      data: {
        ...strainData,
        phenotypes: phenotypes
          ? {
              create: phenotypes.map((p) => ({
                ...p,
                traitName: p.traitName ?? null,
              })),
            }
          : undefined,
        genetics: genetics
          ? {
              create: genetics,
            }
          : undefined,
      },
      include: {
        sample: {
          select: { id: true, code: true },
        },
        phenotypes: {
          include: {
            traitDefinition: true,
          },
        },
        genetics: true,
      },
    });
  }

  async update(id: number, updateStrainDto: UpdateStrainDto) {
    await this.findOne(id); // Check existence
    await this.validateTaxonomy(updateStrainDto);

    const { phenotypes, genetics, ...strainData } = updateStrainDto;

    return this.prisma.strain.update({
      where: { id },
      data: {
        ...strainData,
        genetics: genetics
          ? {
              upsert: {
                create: genetics,
                update: genetics,
              },
            }
          : undefined,
        phenotypes: phenotypes
          ? {
              deleteMany: {}, // Clear existing phenotypes
              create: phenotypes.map((p) => ({
                ...p,
                traitName: p.traitName ?? null,
              })),
            }
          : undefined,
      },
      include: {
        sample: {
          select: { id: true, code: true },
        },
        phenotypes: {
          include: {
            traitDefinition: true,
          },
        },
        genetics: true,
      },
    });
  }

  async remove(id: number) {
    const strain = await this.prisma.strain.findUnique({
      where: { id },
      include: {
        storage: true,
      },
    });
    if (!strain) {
      throw new NotFoundException(`Strain with ID ${id} not found`);
    }

    await this.prisma.$transaction(async (tx) => {
      // Free storage cells and remove allocations
      for (const allocation of strain.storage) {
        await tx.storageCell.update({
          where: { id: allocation.cellId },
          data: { status: CellStatus.FREE },
        });
        await tx.strainStorage.delete({ where: { id: allocation.id } });
      }

      // Remove links to media
      await tx.strainMedia.deleteMany({ where: { strainId: id } });

      // Photos are set to cascade via Prisma relation
      await tx.strain.delete({ where: { id } });
    });

    return { message: `Strain with ID ${id} deleted successfully` };
  }

  async addMedia(strainId: number, mediaId: number, notes?: string) {
    await this.findOne(strainId);
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });
    if (!media) {
      throw new NotFoundException(`Media with ID ${mediaId} not found`);
    }

    const existing = await this.prisma.strainMedia.findUnique({
      where: { strainId_mediaId: { strainId, mediaId } },
    });
    if (existing) {
      throw new BadRequestException('Media already linked to strain');
    }

    return this.prisma.strainMedia.create({
      data: {
        strainId,
        mediaId,
        notes,
      },
    });
  }

  async removeMedia(strainId: number, mediaId: number) {
    await this.findOne(strainId);
    const existing = await this.prisma.strainMedia.findUnique({
      where: { strainId_mediaId: { strainId, mediaId } },
    });
    if (!existing) {
      throw new NotFoundException('Media link not found');
    }

    await this.prisma.strainMedia.delete({
      where: { strainId_mediaId: { strainId, mediaId } },
    });

    return { message: 'Media link removed' };
  }

  async addPhenotype(strainId: number, dto: CreateStrainPhenotypeDto) {
    await this.findOne(strainId);
    return this.prisma.strainPhenotype.create({
      data: {
        strainId,
        ...dto,
      },
    });
  }

  async getPhenotypes(strainId: number) {
    await this.findOne(strainId);
    return this.prisma.strainPhenotype.findMany({
      where: { strainId },
      include: {
        traitDefinition: true,
      },
    });
  }

  async uploadPhoto(strainId: number, file: Express.Multer.File) {
    await this.findOne(strainId); // Check strain exists

    try {
      const hasPrimary = await this.prisma.strainPhoto.findFirst({
        where: { strainId, isPrimary: true },
        select: { id: true },
      });
      const result = await this.imagekitService.uploadImage(
        file.buffer,
        file.originalname,
        `strain-photos/${strainId}`,
      );

      const photo = await this.prisma.strainPhoto.create({
        data: {
          strainId,
          url: result.url,
          isPrimary: !hasPrimary,
          meta: {
            originalName: file.originalname,
            size: result.size,
            width: result.width,
            height: result.height,
            fileType: result.fileType,
            fileId: result.fileId,
          },
        },
      });

      return photo;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException('Failed to upload photo: ' + message);
    }
  }

  async deletePhoto(photoId: number) {
    const photo = await this.prisma.strainPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new NotFoundException(`Photo with ID ${photoId} not found`);
    }

    try {
      const meta = photo.meta as { fileId?: string } | null;
      if (meta?.fileId) {
        await this.imagekitService.deleteImage(meta.fileId);
      }
    } catch (error) {
      console.error('Failed to delete file from ImageKit:', error);
    }

    await this.prisma.strainPhoto.delete({
      where: { id: photoId },
    });

    if (photo.isPrimary) {
      const nextPrimary = await this.prisma.strainPhoto.findFirst({
        where: { strainId: photo.strainId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      if (nextPrimary) {
        await this.prisma.strainPhoto.update({
          where: { id: nextPrimary.id },
          data: { isPrimary: true },
        });
      }
    }

    return { message: 'Photo deleted successfully' };
  }

  async updatePhoto(
    photoId: number,
    payload: { name?: string; isPrimary?: boolean },
  ) {
    const photo = await this.prisma.strainPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new NotFoundException(`Photo with ID ${photoId} not found`);
    }

    const trimmedName = payload.name?.trim();
    if (payload.name !== undefined && !trimmedName) {
      throw new BadRequestException('Photo name is required');
    }

    return this.prisma.$transaction(async (tx) => {
      if (payload.isPrimary === true) {
        await tx.strainPhoto.updateMany({
          where: { strainId: photo.strainId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      if (payload.isPrimary === false && photo.isPrimary) {
        await tx.strainPhoto.update({
          where: { id: photoId },
          data: { isPrimary: false },
        });

        const nextPrimary = await tx.strainPhoto.findFirst({
          where: { strainId: photo.strainId, id: { not: photoId } },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
        });

        if (nextPrimary) {
          await tx.strainPhoto.update({
            where: { id: nextPrimary.id },
            data: { isPrimary: true },
          });
        }
      }

      const meta = (photo.meta ?? {}) as Prisma.JsonObject;
      const nextMeta: Prisma.InputJsonValue =
        trimmedName !== undefined ? { ...meta, originalName: trimmedName } : meta;

      return tx.strainPhoto.update({
        where: { id: photoId },
        data: {
          meta: nextMeta,
          isPrimary:
            payload.isPrimary === true
              ? true
              : payload.isPrimary === false
                ? false
                : photo.isPrimary,
        },
      });
    });
  }

  private async validateTaxonomy(dto: CreateStrainDto | UpdateStrainDto) {
    const rule = this.getTaxonomyRule(dto.ncbiScientificName);
    if (!rule || !rule.gramStain) return;

    const gramTrait = await this.getGramStainTrait();
    const gramStain = this.findGramStainPhenotype(
      dto.phenotypes,
      gramTrait?.id,
    );
    if (!gramStain) return;

    const normalized = this.parseGramResult(gramStain.result);
    if (!normalized) return;

    if (rule.gramStain !== normalized) {
      throw new BadRequestException(
        `Biological mismatch: Genus ${rule.genus} is Gram-${rule.gramStain}.`,
      );
    }
  }

  private getTaxonomyRule(
    scientificName?: string | null,
  ): TaxonomyRule | null {
    if (!scientificName) return null;
    const name = scientificName.toLowerCase();
    return TAXONOMY_RULES.find((rule) => name.includes(rule.genus)) ?? null;
  }

  private async getGramStainTrait(): Promise<{ id: number; name: string } | null> {
    if (this.gramStainTraitCache !== undefined) {
      return this.gramStainTraitCache;
    }

    const trait = await this.prisma.traitDefinition.findUnique({
      where: { code: 'gram_stain' },
      select: { id: true, name: true },
    });

    this.gramStainTraitCache = trait ?? null;
    return this.gramStainTraitCache;
  }

  private normalizeTraitName(name?: string | null): string | null {
    if (!name) return null;
    return name
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private findGramStainPhenotype(
    phenotypes?: {
      traitDefinitionId?: number | null;
      traitName?: string | null;
      result?: string | null;
    }[],
    gramTraitId?: number,
  ): {
    traitDefinitionId?: number | null;
    traitName?: string | null;
    result?: string | null;
  } | null {
    if (!phenotypes?.length) return null;

    const matchesById =
      gramTraitId !== undefined && gramTraitId !== null
        ? phenotypes.find((p) => p.traitDefinitionId === gramTraitId)
        : undefined;
    if (matchesById) return matchesById;

    return (
      phenotypes.find((p) => {
        const normalized = this.normalizeTraitName(p.traitName);
        return normalized === 'gram stain';
      }) ?? null
    );
  }

  private parseGramResult(
    result?: string | null,
  ): 'positive' | 'negative' | null {
    if (!result) return null;
    const normalized = result.toLowerCase().trim();
    if (!normalized) return null;

    if (
      normalized === '+' ||
      normalized === 'positive' ||
      normalized.includes('positive')
    ) {
      return 'positive';
    }
    if (
      normalized === '-' ||
      normalized === 'negative' ||
      normalized.includes('negative')
    ) {
      return 'negative';
    }

    return null;
  }

  private buildTraitFilter(
    code: string,
    names: string[],
    isPositive: boolean,
  ): Prisma.StrainWhereInput {
    const resultFilter: Prisma.StrainPhenotypeWhereInput = {
      OR: isPositive
        ? [
            { result: { equals: 'true', mode: 'insensitive' } },
            { result: { equals: '+', mode: 'insensitive' } },
            { result: { contains: 'positive', mode: 'insensitive' } },
          ]
        : [
            { result: { equals: 'false', mode: 'insensitive' } },
            { result: { equals: '-', mode: 'insensitive' } },
            { result: { contains: 'negative', mode: 'insensitive' } },
          ],
    };

    const nameMatches = names.map((name) => ({
      traitName: { equals: name, mode: Prisma.QueryMode.insensitive },
    }));

    return {
      phenotypes: {
        some: {
          AND: [
            {
              OR: [
                { traitDefinition: { is: { code } } },
                ...nameMatches,
              ],
            },
            resultFilter,
          ],
        },
      },
    };
  }

  /* ----------------------------------------------------------------- */
  /*  CSV import                                                        */
  /*                                                                    */
  /*  Imports flat passport fields, NCBI taxonomy, genetics, and        */
  /*  phenotypes. Storage allocations, linked media, and photos are     */
  /*  intentionally NOT imported — that would risk corrupting cell      */
  /*  occupancy and require complex conflict resolution. Those          */
  /*  relations remain whatever they were before the import for an      */
  /*  existing strain, or empty for a newly-created one.                */
  /* ----------------------------------------------------------------- */

  private validateStrainRow(
    raw: Record<string, string>,
    rowNum: number,
    sampleIndex: Map<string, number>,
    traitIndex: Map<
      string,
      {
        id: number;
        code: string;
        name: string;
        dataType: string;
      }
    >,
    headerSet: Set<string>,
  ): PreparedStrainRow {
    const errors: ImportRowError[] = [];

    const identifier = (raw['Identifier'] ?? '').trim();
    if (!identifier) {
      errors.push({ field: 'Identifier', message: 'Required' });
    }

    const sampleCode = (raw['Sample Code'] ?? '').trim();
    let sampleId: number | undefined;
    if (!sampleCode) {
      errors.push({ field: 'Sample Code', message: 'Required' });
    } else {
      sampleId = sampleIndex.get(sampleCode.toLowerCase());
      if (sampleId === undefined) {
        errors.push({
          field: 'Sample Code',
          message: `Sample with code "${sampleCode}" not found`,
        });
      }
    }

    /**
     * Read an optional column from the row only when its header was actually
     * present in the CSV. This separates "column absent" (do not touch the
     * existing field) from "column present but empty" (clear the field).
     *
     * Returns:
     *   - `undefined` when the header is missing → caller skips the field
     *   - `null` when the header is present but cell is blank → caller writes null
     *   - parser-coerced value otherwise
     */
    const readOptional = <T>(
      header: string,
      parse: (raw: string) => T | null | undefined,
    ): T | null | undefined => {
      if (!headerSet.has(header)) return undefined;
      const value = (raw[header] ?? '').trim();
      if (!value) return null;
      const parsed = parse(value);
      return parsed === undefined ? null : parsed;
    };

    const readString = (header: string): string | null | undefined =>
      readOptional<string>(header, (s) => s);

    const readNumber = (header: string): number | null | undefined => {
      if (!headerSet.has(header)) return undefined;
      const rawValue = (raw[header] ?? '').trim();
      if (!rawValue) return null;
      const parsed = parseOptionalNumber(rawValue);
      if (parsed === null) {
        errors.push({
          field: header,
          message: `Invalid number "${rawValue}"`,
        });
        return null;
      }
      return parsed ?? null;
    };

    const readEnum = <T extends string>(
      header: string,
      allowed: readonly T[],
    ): T | null | undefined => {
      if (!headerSet.has(header)) return undefined;
      const rawValue = (raw[header] ?? '').trim();
      if (!rawValue) return null;
      const coerced = this.coerceEnum<T>(rawValue, allowed, header, errors);
      return coerced ?? null;
    };

    const ncbiTaxonomyId = readNumber('NCBI Taxonomy ID');
    const passageNumber = readNumber('Passage Number');
    const biosafetyLevel = readEnum<BiosafetyLevelEnum>(
      'Biosafety Level',
      BIOSAFETY_LEVEL_VALUES,
    );
    const stockType = readEnum<StockTypeEnum>('Stock Type', STOCK_TYPE_VALUES);
    const isolationRegion = readEnum<IsolationRegionEnum>(
      'Isolation Region',
      ISOLATION_REGION_VALUES,
    );
    const wgsStatus = readEnum<WgsStatusEnum>(
      'WGS Status',
      WGS_STATUS_VALUES,
    );

    // Phenotypes: parse aggregated column, look up trait definitions by name.
    // `phenotypes: undefined` signals "no Phenotypes column in CSV", which the
    // commit path uses to leave existing phenotypes untouched.
    let phenotypes: PreparedStrainPhenotype[] | undefined;
    if (headerSet.has('Phenotypes')) {
      phenotypes = [];
      const phenotypeStr = (raw['Phenotypes'] ?? '').trim();
      if (phenotypeStr) {
        for (const p of parsePhenotypesColumn(phenotypeStr)) {
          const trait = traitIndex.get(p.name.toLowerCase());
          if (!trait) {
            errors.push({
              field: 'Phenotypes',
              message: `Unknown trait "${p.name}"`,
            });
            continue;
          }

          let result = p.value;
          if (trait.dataType === 'BOOLEAN') {
            const v = result.toLowerCase().trim();
            if (['true', '1', 'yes', '+', 'positive'].includes(v))
              result = 'true';
            else if (['false', '0', 'no', '-', 'negative'].includes(v))
              result = 'false';
          }

          phenotypes.push({
            traitDefinitionId: trait.id,
            traitName: trait.name,
            result,
            method: p.method,
          });
        }
      }
    }

    // Genetics is grouped into a single nested record. We treat the four
    // genetics columns collectively: if NONE of them are in the CSV, leave
    // existing genetics untouched. If at least one is present, build the
    // payload from whichever subset is provided.
    const geneticsHeaders = [
      'WGS Status',
      'Assembly Accession',
      '16S Accession',
      '16S Sequence',
    ] as const;
    const hasAnyGeneticsHeader = geneticsHeaders.some((h) => headerSet.has(h));
    let genetics: PreparedStrainGenetics | undefined;
    if (hasAnyGeneticsHeader) {
      const assemblyAccession = (raw['Assembly Accession'] ?? '').trim();
      const marker16sAccession = (raw['16S Accession'] ?? '').trim();
      const marker16sSequence = (raw['16S Sequence'] ?? '').trim();
      const anyValue =
        Boolean(wgsStatus) ||
        Boolean(assemblyAccession) ||
        Boolean(marker16sAccession) ||
        Boolean(marker16sSequence);
      if (anyValue) {
        genetics = {
          wgsStatus:
            wgsStatus && wgsStatus !== null
              ? (wgsStatus as WgsStatusEnum)
              : 'NONE',
          assemblyAccession: assemblyAccession || undefined,
          marker16sAccession: marker16sAccession || undefined,
          marker16sSequence: marker16sSequence || undefined,
        };
      }
    }

    if (errors.length > 0 || !identifier || sampleId === undefined) {
      return { rowNum, identifier: identifier || undefined, errors, data: null };
    }

    // Build the prepared payload using conditional spread so absent columns
    // never appear as keys at all — caller treats `key in data` as the
    // presence signal.
    const data: PreparedStrainData = {
      identifier,
      sampleId,
      phenotypes,
      genetics,
    };

    const setOpt = <K extends keyof PreparedStrainData>(
      key: K,
      value: PreparedStrainData[K] | null | undefined,
    ) => {
      if (value !== undefined) {
        // null means "explicitly clear", string means "set value".
        // We keep null in the prepared payload; commit converts it to
        // Prisma null on update.
        data[key] = value as PreparedStrainData[K];
      }
    };

    setOpt('ncbiScientificName', readString('NCBI Scientific Name'));
    setOpt(
      'ncbiTaxonomyId',
      ncbiTaxonomyId === null ? null : ncbiTaxonomyId,
    );
    setOpt(
      'biosafetyLevel',
      biosafetyLevel === null
        ? null
        : (biosafetyLevel as BiosafetyLevelEnum | undefined),
    );
    setOpt(
      'stockType',
      stockType === null ? null : (stockType as StockTypeEnum | undefined),
    );
    setOpt('passageNumber', passageNumber === null ? null : passageNumber);
    setOpt('taxonomy16s', readString('Taxonomy 16S'));
    setOpt('otherTaxonomy', readString('Other Taxonomy'));
    setOpt('collectionRcam', readString('Collection RCAM'));
    setOpt('indexerInitials', readString('Indexer Initials'));
    setOpt(
      'isolationRegion',
      isolationRegion === null
        ? null
        : (isolationRegion as IsolationRegionEnum | undefined),
    );
    setOpt('features', readString('Features'));
    setOpt('comments', readString('Comments'));

    return {
      rowNum,
      identifier,
      errors: [],
      data,
    };
  }

  private coerceEnum<T extends string>(
    raw: string | undefined,
    allowed: readonly T[],
    field: string,
    errors: ImportRowError[],
  ): T | undefined {
    const v = (raw ?? '').trim();
    if (!v) return undefined;
    const normalised = v.toUpperCase().replace(/\s+/g, '_');
    if ((allowed as readonly string[]).includes(normalised)) {
      return normalised as T;
    }
    errors.push({
      field,
      message: `Invalid value "${v}". Expected one of: ${allowed.join(', ')}`,
    });
    return undefined;
  }

  private async prepareStrainsImport(
    buffer: Buffer,
  ): Promise<PreparedStrainRow[]> {
    const { headers, rows } = parseCsvBuffer(buffer);
    if (rows.length === 0) return [];

    const headerSet = new Set(headers);

    // Bulk-load reference data so we don't hit the database per row
    const sampleCodes = Array.from(
      new Set(
        rows
          .map((r) => (r['Sample Code'] ?? '').trim())
          .filter((c): c is string => Boolean(c)),
      ),
    );
    const samples = sampleCodes.length
      ? await this.prisma.sample.findMany({
          where: { code: { in: sampleCodes } },
          select: { id: true, code: true },
        })
      : [];
    const sampleIndex = new Map<string, number>();
    for (const s of samples) {
      sampleIndex.set(s.code.toLowerCase(), s.id);
    }

    const traits = await this.prisma.traitDefinition.findMany({
      select: { id: true, code: true, name: true, dataType: true },
    });
    const traitIndex = new Map<
      string,
      { id: number; code: string; name: string; dataType: string }
    >();
    for (const t of traits) {
      traitIndex.set(t.name.toLowerCase(), t);
      traitIndex.set(t.code.toLowerCase(), t);
    }

    return rows.map((row, idx) =>
      this.validateStrainRow(row, idx + 1, sampleIndex, traitIndex, headerSet),
    );
  }

  async dryRunStrainsImport(buffer: Buffer): Promise<ImportReport> {
    const prepared = await this.prepareStrainsImport(buffer);

    const identifiers = prepared
      .map((p) => p.data?.identifier)
      .filter((i): i is string => Boolean(i));
    const existing = identifiers.length
      ? await this.prisma.strain.findMany({
          where: { identifier: { in: identifiers } },
          select: { identifier: true },
        })
      : [];
    const existingSet = new Set(existing.map((e) => e.identifier));

    const result: ImportRowResult[] = prepared.map((r) => {
      if (r.errors.length > 0 || !r.data) {
        return {
          rowNum: r.rowNum,
          identifier: r.identifier,
          status: 'error',
          errors: r.errors,
        };
      }
      const isUpdate = existingSet.has(r.data.identifier);
      return {
        rowNum: r.rowNum,
        identifier: r.identifier,
        status: isUpdate ? 'update' : 'create',
        errors: [],
      };
    });

    return { summary: buildSummary(result), rows: result };
  }

  async commitStrainsImport(buffer: Buffer): Promise<ImportReport> {
    const prepared = await this.prepareStrainsImport(buffer);
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
        const wasUpdate = await this.applyStrainImportRow(r.data);
        result.push({
          rowNum: r.rowNum,
          identifier: r.identifier,
          status: wasUpdate ? 'update' : 'create',
          errors: [],
        });
      } catch (err) {
        // Log full error server-side for debugging — UI gets a sanitised summary.
        console.error(
          `[strains-import] row ${r.rowNum} (${r.identifier}) failed:`,
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
   * Deduplicate phenotypes by traitDefinitionId — last value wins.
   *
   * Why: StrainPhenotype has @@unique([strainId, traitDefinitionId]).
   * If a CSV row accidentally contains two rows for the same trait
   * (export ambiguity, manual edit), naive `create` would violate the
   * constraint mid-transaction and abort the whole row. Dedup keeps
   * the import lenient and predictable.
   */
  private dedupePhenotypes(
    phenotypes: PreparedStrainPhenotype[],
  ): PreparedStrainPhenotype[] {
    const byTraitId = new Map<number, PreparedStrainPhenotype>();
    for (const p of phenotypes) {
      byTraitId.set(p.traitDefinitionId, p);
    }
    return Array.from(byTraitId.values());
  }

  /**
   * Apply one validated row in its own transaction. Each strain is upserted
   * by `identifier`. Nested writes are conditional:
   *   - phenotypes: replaced (deleteMany + create) ONLY when the CSV row
   *     actually carries phenotype data; an empty Phenotypes column is
   *     treated as "do not touch" rather than "wipe everything", which
   *     matches user intent for partial-column CSVs.
   *   - genetics: upserted ONLY when the CSV row has at least one
   *     genetics field set; otherwise the existing genetics record is
   *     left untouched.
   * Storage, media, and photos are NEVER touched on import — see header.
   */
  /**
   * Build the `data` payload for both `update` and `create` paths from a
   * PreparedStrainData object using the absence-vs-empty convention:
   * fields present on `data` flow through; absent fields stay absent so
   * Prisma leaves the existing column untouched on update (or applies the
   * column default on create).
   *
   * Mode "create" additionally injects `identifier` and the `sample`
   * connect; "update" omits those because identifier is the upsert key
   * and sample is reconnected only when the row carries a value.
   */
  private buildStrainPayload(
    data: PreparedStrainData,
    mode: 'create' | 'update',
  ): Prisma.StrainUpdateInput | Prisma.StrainCreateInput {
    const payload: Prisma.StrainUpdateInput = {};

    if (mode === 'create') {
      (payload as Prisma.StrainCreateInput).identifier = data.identifier;
    }
    // Sample is required on create; on update we reconnect only if the
    // CSV explicitly set Sample Code (which is always present in valid rows
    // — see validateStrainRow which errors out without it).
    payload.sample = { connect: { id: data.sampleId } };

    if ('ncbiScientificName' in data)
      payload.ncbiScientificName = data.ncbiScientificName;
    if ('ncbiTaxonomyId' in data)
      payload.ncbiTaxonomyId = data.ncbiTaxonomyId;
    if ('biosafetyLevel' in data)
      payload.biosafetyLevel = data.biosafetyLevel;
    if ('stockType' in data) payload.stockType = data.stockType;
    if ('passageNumber' in data)
      payload.passageNumber = data.passageNumber;
    if ('taxonomy16s' in data) payload.taxonomy16s = data.taxonomy16s;
    if ('otherTaxonomy' in data)
      payload.otherTaxonomy = data.otherTaxonomy;
    if ('collectionRcam' in data)
      payload.collectionRcam = data.collectionRcam;
    if ('indexerInitials' in data)
      payload.indexerInitials = data.indexerInitials;
    if ('isolationRegion' in data)
      payload.isolationRegion = data.isolationRegion;
    if ('features' in data) payload.features = data.features;
    if ('comments' in data) payload.comments = data.comments;

    return payload;
  }

  private async applyStrainImportRow(
    data: PreparedStrainData,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.strain.findUnique({
        where: { identifier: data.identifier },
        select: { id: true },
      });

      const dedupedPhenotypes = data.phenotypes
        ? this.dedupePhenotypes(data.phenotypes)
        : undefined;

      if (existing) {
        const updateData = this.buildStrainPayload(
          data,
          'update',
        ) as Prisma.StrainUpdateInput;

        // Phenotypes column was present in CSV → replace wholesale.
        // Column absent → leave existing phenotypes alone.
        if (dedupedPhenotypes !== undefined) {
          updateData.phenotypes = {
            deleteMany: {},
            create: dedupedPhenotypes.map((p) => ({
              traitDefinitionId: p.traitDefinitionId,
              traitName: p.traitName,
              result: p.result,
              method: p.method ?? null,
            })),
          };
        }

        await tx.strain.update({
          where: { id: existing.id },
          data: updateData,
        });

        // Manual genetics upsert: bypass Prisma nested-upsert which has a
        // known quirk where the `create` branch is sometimes evaluated even
        // for existing one-to-one relations, producing a P2002 on the
        // child PK. Doing it ourselves makes the path explicit.
        if (data.genetics) {
          const geneticsPayload = {
            wgsStatus: data.genetics.wgsStatus ?? 'NONE',
            assemblyAccession: data.genetics.assemblyAccession ?? null,
            marker16sAccession: data.genetics.marker16sAccession ?? null,
            marker16sSequence: data.genetics.marker16sSequence ?? null,
          };
          const existingGenetics = await tx.strainGenetics.findUnique({
            where: { strainId: existing.id },
            select: { id: true },
          });
          if (existingGenetics) {
            await tx.strainGenetics.update({
              where: { id: existingGenetics.id },
              data: geneticsPayload,
            });
          } else {
            await tx.strainGenetics.create({
              data: { ...geneticsPayload, strainId: existing.id },
            });
          }
        }

        return true;
      }

      const createData = this.buildStrainPayload(
        data,
        'create',
      ) as Prisma.StrainCreateInput;

      if (dedupedPhenotypes && dedupedPhenotypes.length > 0) {
        createData.phenotypes = {
          create: dedupedPhenotypes.map((p) => ({
            traitDefinitionId: p.traitDefinitionId,
            traitName: p.traitName,
            result: p.result,
            method: p.method ?? null,
          })),
        };
      }

      if (data.genetics) {
        createData.genetics = {
          create: {
            wgsStatus: data.genetics.wgsStatus ?? 'NONE',
            assemblyAccession: data.genetics.assemblyAccession ?? null,
            marker16sAccession: data.genetics.marker16sAccession ?? null,
            marker16sSequence: data.genetics.marker16sSequence ?? null,
          },
        };
      }

      await tx.strain.create({ data: createData });
      return false;
    });
  }
}
