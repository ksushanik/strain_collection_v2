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

@Injectable()
export class StrainsService {
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
      search,
      isolationRegion,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = query;

    const where: Prisma.StrainWhereInput = {};

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
               traitDefinition: { code: 'gram_stain' }
             },
             select: {
                result: true
             },
             take: 1
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
      data: strains.map(s => ({
        ...s,
        gramStainLabel: s.phenotypes?.[0]?.result || null,
        phenotypes: undefined, // Hide the raw array from response to keep it clean, or keep it if needed. Keeping clean.
      })),
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
    this.validateTaxonomy(createStrainDto);
    let { phenotypes, genetics, ...strainData } = createStrainDto;

    // Auto-enrich based on taxonomy if needed
    if (
      createStrainDto.ncbiScientificName?.toLowerCase().includes('stenotrophomonas')
    ) {
      // Check if Gram Stain is already provided in phenotypes
      const hasGramStain = phenotypes?.some((p) => p.traitName === 'Gram Stain');
      if (!hasGramStain) {
        phenotypes = phenotypes || [];
        phenotypes.push({
          traitName: 'Gram Stain',
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
    this.validateTaxonomy(updateStrainDto);

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

  private validateTaxonomy(dto: CreateStrainDto | UpdateStrainDto) {
    if (dto.ncbiScientificName) {
      const name = dto.ncbiScientificName.toLowerCase();

      // Example rule: Stenotrophomonas is Gram Negative
      if (name.includes('stenotrophomonas')) {
        // Check phenotypes
        const gramStain = dto.phenotypes?.find(
          (p) => p.traitName === 'Gram Stain',
        );
        if (gramStain) {
          const result = gramStain.result.toLowerCase();
          if (
            result === '+' ||
            result === 'positive' ||
            result.includes('positive')
          ) {
            throw new BadRequestException(
              'Biological mismatch: Genus Stenotrophomonas is Gram-negative.',
            );
          }
        }
      }
    }
  }
}
