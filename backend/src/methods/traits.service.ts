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
    const existing = await this.ensureExists(id);
    
    // @ts-ignore: Prisma Client needs regeneration
    if (existing.isSystem) {
      if (dto.code && dto.code !== existing.code) {
        throw new NotFoundException(`Cannot change code for system trait`); // Using NotFound as generic client error, ideally BadRequest
      }
      if (dto.dataType && dto.dataType !== existing.dataType) {
        throw new NotFoundException(`Cannot change dataType for system trait`);
      }
    }

    return this.prisma.traitDefinition.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const existing = await this.ensureExists(id);
    // @ts-ignore: Prisma Client needs regeneration
    if (existing.isSystem) {
      throw new NotFoundException(`Cannot delete system trait`);
    }
    return this.prisma.traitDefinition.delete({ where: { id } });
  }

  async onModuleInit() {
    await this.seedSystemTraits();
  }

  private async seedSystemTraits() {
    const gramStain = await this.prisma.traitDefinition.findUnique({
      where: { code: 'gram_stain' },
    });

    if (!gramStain) {
      await this.prisma.traitDefinition.create({
        data: {
          name: 'Gram Stain',
          code: 'gram_stain',
          dataType: 'CATEGORICAL',
          // @ts-ignore: Prisma Client needs regeneration
          category: 'MORPHOLOGY',
          options: ['Positive (+)', 'Negative (-)', 'Variable'],
          // @ts-ignore: Prisma Client needs regeneration
          isSystem: true,
        },
      });
      console.log('Seeded system trait: Gram Stain');
    }
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
        // @ts-ignore: Prisma Client needs regeneration
        category: true,
        defaultMethod: true,
        // @ts-ignore: Prisma Client needs regeneration
        isSystem: true,
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
    return trait;
  }
}
