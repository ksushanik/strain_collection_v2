import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleQueryDto } from './dto/sample-query.dto';

@Injectable()
export class SamplesService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: SampleQueryDto) {
        const { sampleType, search, page = 1, limit = 50 } = query;

        const where: any = {};

        if (sampleType) where.sampleType = sampleType;

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
        await this.findOne(id); // Check existence

        await this.prisma.sample.delete({
            where: { id },
        });

        return { message: `Sample with ID ${id} deleted successfully` };
    }
}
