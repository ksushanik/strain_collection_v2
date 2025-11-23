import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleQueryDto } from './dto/sample-query.dto';
import { ImageKitService } from '../services/imagekit.service';

@Injectable()
export class SamplesService {
  constructor(
    private prisma: PrismaService,
    private imagekitService: ImageKitService,
  ) {}

  async findAll(query: SampleQueryDto) {
    const {
      sampleType,
      search,
      dateFrom,
      dateTo,
      site,
      latMin,
      latMax,
      lngMin,
      lngMax,
      page = 1,
      limit = 50,
    } = query;

    const where: any = {};

    if (sampleType) where.sampleType = sampleType;

    if (dateFrom || dateTo) {
      where.collectedAt = {};
      if (dateFrom) {
        where.collectedAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.collectedAt.lte = new Date(dateTo);
      }
    }

    if (site) {
      where.siteName = { contains: site, mode: 'insensitive' };
    }

    if (latMin !== undefined || latMax !== undefined) {
      where.lat = {};
      if (latMin !== undefined) where.lat.gte = latMin;
      if (latMax !== undefined) where.lat.lte = latMax;
    }

    if (lngMin !== undefined || lngMax !== undefined) {
      where.lng = {};
      if (lngMin !== undefined) where.lng.gte = lngMin;
      if (lngMax !== undefined) where.lng.lte = lngMax;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { siteName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

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
        orderBy: { createdAt: 'desc' },
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

  async findOne(id: number) {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
      include: {
        strains: {
          select: {
            id: true,
            identifier: true,
            seq: true,
            gramStain: true,
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
    return this.prisma.sample.create({
      data: {
        ...createSampleDto,
        collectedAt: new Date(createSampleDto.collectedAt),
      },
    });
  }

  async update(id: number, updateSampleDto: UpdateSampleDto) {
    await this.findOne(id); // Check existence

    const data: any = { ...updateSampleDto };
    if (updateSampleDto.collectedAt) {
      data.collectedAt = new Date(updateSampleDto.collectedAt);
    }

    return this.prisma.sample.update({
      where: { id },
      data,
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
    const meta = photo.meta as any;
    if (meta?.fileId) {
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
}
