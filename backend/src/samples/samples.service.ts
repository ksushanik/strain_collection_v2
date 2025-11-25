import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleQueryDto } from './dto/sample-query.dto';
import { ImageKitService } from '../services/imagekit.service';

@Injectable()
export class SamplesService {
  constructor(
    private prisma: PrismaService,
    private imagekitService: ImageKitService,
  ) { }

  async findAll(query: SampleQueryDto) {
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
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
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

    // Dynamic sorting
    const orderBy: Prisma.SampleOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

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

      // 2. Create Sample with a temporary code
      // We use a random string to satisfy the unique constraint temporarily
      const tempCode = `TEMP_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const sample = await tx.sample.create({
        data: {
          ...createSampleDto,
          code: tempCode,
          sampleType: 'OTHER', // Default/Fallback for the enum field
          collectedAt: new Date(createSampleDto.collectedAt),
        },
      });

      // 3. Generate the final code based on ID
      // Format: ID_SLUG_SUBJECT
      const subjectSlug = createSampleDto.subject
        ? createSampleDto.subject.replace(/\s+/g, '-')
        : 'NoSubject';
      const finalCode = `${sample.id}_${sampleType.slug}_${subjectSlug}`;

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
    await this.findOne(id); // Check existence

    const data: Prisma.SampleUpdateInput = { ...updateSampleDto };
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
}
