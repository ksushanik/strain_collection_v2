import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMethodDto } from './dto/create-method.dto';
import { MethodQueryDto } from './dto/method-query.dto';
import { UpdateMethodDto } from './dto/update-method.dto';

@Injectable()
export class MethodsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: MethodQueryDto) {
    const { search, page = 1, limit = 50 } = query;

    const where: Prisma.MethodWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.method.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.method.count({ where }),
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
    const method = await this.prisma.method.findUnique({ where: { id } });
    if (!method) {
      throw new NotFoundException(`Method with ID ${id} not found`);
    }
    return method;
  }

  async create(dto: CreateMethodDto) {
    return this.prisma.method.create({ data: dto });
  }

  async update(id: number, dto: UpdateMethodDto) {
    await this.ensureExists(id);
    return this.prisma.method.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.method.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const method = await this.prisma.method.findUnique({ where: { id } });
    if (!method) {
      throw new NotFoundException(`Method with ID ${id} not found`);
    }
  }
}

