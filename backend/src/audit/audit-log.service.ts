import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    userId: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: string;
    entityId: number;
    changes?: any;
    metadata?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        changes: params.changes || {},
        metadata: params.metadata || {},
      },
    });
  }

  async findAll(filters?: {
    userId?: number;
    entity?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.auditLog.findMany({
      where: {
        userId: filters?.userId,
        entity: filters?.entity,
        createdAt: {
          gte: filters?.startDate,
          lte: filters?.endDate,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000, // Лимит для производительности
    });
  }

  async findByUser(userId: number, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByEntity(entity: string, entityId: number) {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
