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

@Injectable()
export class StrainsService {
  private gramStainTraitCache?: { id: number; name: string } | null;

  constructor(
    private prisma: PrismaService,
    private imagekitService: ImageKitService,
  ) {}

  async findAll(query: StrainQueryDto) {
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
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
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
      where.OR = [
        ...(where.OR || []),
        { taxonomy16s: { contains: taxonomy, mode: 'insensitive' } },
        { ncbiScientificName: { contains: taxonomy, mode: 'insensitive' } },
      ];
    }
    if (sampleCode) {
      where.sample = {
        is: { code: { contains: sampleCode, mode: 'insensitive' } },
      };
    }

    if (search) {
      where.OR = [
        ...(where.OR || []),
        { identifier: { contains: search, mode: 'insensitive' } },
        { features: { contains: search, mode: 'insensitive' } },
        { comments: { contains: search, mode: 'insensitive' } },
        { ncbiScientificName: { contains: search, mode: 'insensitive' } },
        { taxonomy16s: { contains: search, mode: 'insensitive' } },
      ];
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

    // Dynamic sorting
    const orderBy: Prisma.StrainOrderByWithRelationInput =
      sortBy === 'sampleCode'
        ? { sample: { code: sortOrder } }
        : ({ [sortBy]: sortOrder } as Prisma.StrainOrderByWithRelationInput);

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
                select: { code: true },
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
        photos: true,
        phenotypes: {
          include: {
            traitDefinition: true,
          } as any,
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
    let { phenotypes, genetics, ...strainData } = createStrainDto;

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
          } as any,
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
          } as any,
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
      } as any,
    });
  }

  async getPhenotypes(strainId: number) {
    await this.findOne(strainId);
    return this.prisma.strainPhenotype.findMany({
      where: { strainId },
      include: {
        traitDefinition: true,
      } as any,
    });
  }

  async uploadPhoto(strainId: number, file: Express.Multer.File) {
    await this.findOne(strainId); // Check strain exists

    try {
      const result = await this.imagekitService.uploadImage(
        file.buffer,
        file.originalname,
        `strain-photos/${strainId}`,
      );

      const photo = await this.prisma.strainPhoto.create({
        data: {
          strainId,
          url: result.url,
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

    return { message: 'Photo deleted successfully' };
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
}
