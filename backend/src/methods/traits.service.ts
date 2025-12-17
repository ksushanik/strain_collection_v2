import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTraitDto } from './dto/create-trait.dto';
import { UpdateTraitDto } from './dto/update-trait.dto';
import { Prisma, TraitDataType } from '@prisma/client';

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
    const systemTraits: Prisma.TraitDefinitionUncheckedCreateInput[] = [
      {
        name: 'Gram Stain',
        code: 'gram_stain',
        dataType: TraitDataType.CATEGORICAL,
        category: 'MORPHOLOGY',
        options: ['+', '-', 'Variable'],
        isSystem: true,
      },
      {
        name: 'Amylase',
        code: 'amylase',
        dataType: TraitDataType.CATEGORICAL,
        category: 'BIOCHEMISTRY',
        options: ['+', '-'],
        isSystem: true,
      },
      {
        name: 'IUK / IAA',
        code: 'iuk_iaa',
        dataType: TraitDataType.TEXT,
        category: 'BIOCHEMISTRY',
        isSystem: true,
      },
      {
        name: 'Antibiotic Activity',
        code: 'antibiotic_activity',
        dataType: TraitDataType.TEXT,
        category: 'ANTIBIOTICS',
        isSystem: true,
      },
      {
        name: 'Sequenced (SEQ)',
        code: 'sequenced_seq',
        dataType: TraitDataType.BOOLEAN,
        category: 'GENETICS',
        isSystem: true,
      },
      {
        name: 'Phosphate Solubilization',
        code: 'phosphate_solubilization',
        dataType: TraitDataType.BOOLEAN,
        category: 'BIOCHEMISTRY',
        isSystem: true,
      },
      {
        name: 'Siderophore Production',
        code: 'siderophore_production',
        dataType: TraitDataType.BOOLEAN,
        category: 'BIOCHEMISTRY',
        isSystem: true,
      },
      {
        name: 'Pigment Secretion',
        code: 'pigment_secretion',
        dataType: TraitDataType.BOOLEAN,
        category: 'MORPHOLOGY',
        isSystem: true,
      },
    ];

    await Promise.all(
      systemTraits.map((trait) =>
        this.prisma.traitDefinition.upsert({
          where: { code: trait.code },
          update: {
            name: trait.name,
            dataType: trait.dataType,
            category: trait.category ?? null,
            options: trait.options ?? undefined,
            isSystem: true,
          },
          create: trait,
        }),
      ),
    );

    await this.linkLegacyPhenotypesToSystemTraits();
  }

  private async linkLegacyPhenotypesToSystemTraits() {
    const system = await this.prisma.traitDefinition.findMany({
      // @ts-ignore: Prisma Client needs regeneration
      where: { isSystem: true },
      select: { id: true, name: true, code: true },
    });

    const byCode = new Map(system.map((t) => [t.code, t] as const));

    const pigment = byCode.get('pigment_secretion');
    if (pigment) {
      await this.prisma.strainPhenotype.updateMany({
        where: {
          traitDefinitionId: null,
          OR: [
            { traitName: { equals: pigment.name, mode: 'insensitive' } },
            { traitName: { equals: 'Pigment Production', mode: 'insensitive' } },
          ],
        },
        data: { traitDefinitionId: pigment.id, traitName: pigment.name },
      });
    }

    await Promise.all(
      system
        .filter((t) => t.code !== 'pigment_secretion')
        .map((t) =>
          this.prisma.strainPhenotype.updateMany({
            where: {
              traitDefinitionId: null,
              traitName: { equals: t.name, mode: 'insensitive' },
            },
            data: { traitDefinitionId: t.id, traitName: t.name },
          }),
        ),
    );
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
