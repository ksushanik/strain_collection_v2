import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateStrainDto } from './dto/create-strain.dto';
import { UpdateStrainDto } from './dto/update-strain.dto';
import { StrainQueryDto } from './dto/strain-query.dto';

@Injectable()
export class StrainsService {
  constructor(private prisma: PrismaService) { }

  async findAll(query: StrainQueryDto) {
    const {
      sampleId,
      seq,
      gramStain,
      phosphates,
      siderophores,
      pigmentSecretion,
      sampleCode,
      antibioticActivity,
      genome,
      hasGenome,
      taxonomy,
      search,
      amylase,
      isolationRegion,
      biochemistry,
      iuk,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = query;

    const where: Prisma.StrainWhereInput = {};

    if (sampleId !== undefined) where.sampleId = sampleId;
    if (seq !== undefined) where.seq = seq;
    if (gramStain) where.gramStain = gramStain;
    if (phosphates !== undefined) where.phosphates = phosphates;
    if (siderophores !== undefined) where.siderophores = siderophores;
    if (pigmentSecretion !== undefined)
      where.pigmentSecretion = pigmentSecretion;
    if (amylase) where.amylase = amylase;
    if (isolationRegion) where.isolationRegion = isolationRegion;
    if (biochemistry)
      where.biochemistry = { contains: biochemistry, mode: 'insensitive' };
    if (iuk) where.iuk = { contains: iuk, mode: 'insensitive' };
    if (antibioticActivity)
      where.antibioticActivity = {
        contains: antibioticActivity,
        mode: 'insensitive',
      };
    if (genome) where.genome = { contains: genome, mode: 'insensitive' };
    if (hasGenome !== undefined) {
      where.genome = hasGenome ? { not: null } : null;
    }
    if (taxonomy) {
      where.OR = [
        ...(where.OR || []),
        { otherTaxonomy: { contains: taxonomy, mode: 'insensitive' } },
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
        { antibioticActivity: { contains: search, mode: 'insensitive' } },
        { genome: { contains: search, mode: 'insensitive' } },
        { genome: { contains: search, mode: 'insensitive' } },
        { otherTaxonomy: { contains: search, mode: 'insensitive' } },
        { biochemistry: { contains: search, mode: 'insensitive' } },
        { iuk: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Dynamic sorting
    const orderBy: Prisma.StrainOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [strains, total] = await Promise.all([
      this.prisma.strain.findMany({
        where,
        include: {
          sample: {
            select: { id: true, code: true, siteName: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.strain.count({ where }),
    ]);

    return {
      data: strains,
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
      },
    });

    if (!strain) {
      throw new NotFoundException(`Strain with ID ${id} not found`);
    }

    return strain;
  }

  async create(createStrainDto: CreateStrainDto) {
    return this.prisma.strain.create({
      data: createStrainDto,
      include: {
        sample: {
          select: { id: true, code: true },
        },
      },
    });
  }

  async update(id: number, updateStrainDto: UpdateStrainDto) {
    await this.findOne(id); // Check existence

    return this.prisma.strain.update({
      where: { id },
      data: updateStrainDto,
      include: {
        sample: {
          select: { id: true, code: true },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check existence

    await this.prisma.strain.delete({
      where: { id },
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
}
