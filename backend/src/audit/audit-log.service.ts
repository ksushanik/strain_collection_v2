import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuditLogService {
  private retentionDays: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const raw = this.configService.get<number | string>(
      'AUDIT_RETENTION_DAYS',
    );
    const parsed = Number(raw);
    this.retentionDays = Number.isFinite(parsed) && parsed > 0 ? parsed : 90;
  }

  async log(params: {
    userId: number;
    action:
      | 'CREATE'
      | 'UPDATE'
      | 'DELETE'
      | 'ALLOCATE'
      | 'UNALLOCATE'
      | 'BULK_ALLOCATE'
      | 'CONFIG';
    entity: string;
    entityId: number;
    changes?: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
    batchId?: string;
    comment?: string;
  }) {
    // Fire-and-forget retention cleanup to keep audit table bounded
    void this.pruneOldLogs();

    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        batchId: params.batchId,
        comment: params.comment,
        changes: params.changes ?? ({} as Prisma.JsonObject),
        metadata: params.metadata ?? ({} as Prisma.JsonObject),
      },
    });
  }

  private async pruneOldLogs() {
    const cutoff = new Date(
      Date.now() - this.retentionDays * 24 * 60 * 60 * 1000,
    );
    try {
      await this.prisma.auditLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
    } catch (error) {
      // Do not block the main flow on cleanup failures
      // Consider adding a dedicated cron in production if needed.
      console.error('Audit prune error:', error);
    }
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
