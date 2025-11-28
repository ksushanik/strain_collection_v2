import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaQueryDto } from './dto/media-query.dto';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: MediaQueryDto) {
    const { search, page = 1, limit = 50 } = query;

    const where: Prisma.MediaWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { composition: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        strains: {
          include: {
            strain: { select: { id: true, identifier: true } },
          },
        },
      },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return media;
  }

  async create(dto: CreateMediaDto) {
    return this.prisma.media.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateMediaDto) {
    await this.ensureExists(id);
    return this.prisma.media.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);

    const usageCount = await this.prisma.strainMedia.count({
      where: { mediaId: id },
    });
    if (usageCount > 0) {
      throw new BadRequestException(
        'Cannot delete media while linked to strains',
      );
    }

    return this.prisma.media.delete({
      where: { id },
    });
  }

  private async ensureExists(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
  }
}
