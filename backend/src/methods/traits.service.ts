import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTraitDto } from './dto/create-trait.dto';
import { UpdateTraitDto } from './dto/update-trait.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TraitsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.traitDefinition.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const trait = await this.prisma.traitDefinition.findUnique({
      where: { id },
    });
    if (!trait) {
      throw new NotFoundException(`TraitDefinition with ID ${id} not found`);
    }
    return trait;
  }

  async create(dto: CreateTraitDto) {
    return this.prisma.traitDefinition.create({ data: dto });
  }

  async update(id: number, dto: UpdateTraitDto) {
    await this.ensureExists(id);
    return this.prisma.traitDefinition.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.traitDefinition.delete({ where: { id } });
  }

  async getDictionary() {
    return this.prisma.traitDefinition.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        dataType: true,
        options: true,
        units: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  private async ensureExists(id: number) {
    const trait = await this.prisma.traitDefinition.findUnique({
      where: { id },
    });
    if (!trait) {
      throw new NotFoundException(`TraitDefinition with ID ${id} not found`);
    }
  }
}
