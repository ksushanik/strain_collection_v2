import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStrainDto } from './dto/create-strain.dto';
import { UpdateStrainDto } from './dto/update-strain.dto';
import { StrainQueryDto } from './dto/strain-query.dto';

@Injectable()
export class StrainsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: StrainQueryDto) {
        const { sampleId, seq, gramStain, phosphates, siderophores, pigmentSecretion, search, page = 1, limit = 50 } = query;

        const where: any = {};

        if (sampleId !== undefined) where.sampleId = sampleId;
        if (seq !== undefined) where.seq = seq;
        if (gramStain) where.gramStain = gramStain;
        if (phosphates !== undefined) where.phosphates = phosphates;
        if (siderophores !== undefined) where.siderophores = siderophores;
        if (pigmentSecretion !== undefined) where.pigmentSecretion = pigmentSecretion;

        if (search) {
            where.OR = [
                { identifier: { contains: search, mode: 'insensitive' } },
                { features: { contains: search, mode: 'insensitive' } },
                { comments: { contains: search, mode: 'insensitive' } },
            ];
        }

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
                orderBy: { createdAt: 'desc' },
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
}
