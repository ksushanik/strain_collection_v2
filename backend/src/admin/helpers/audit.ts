import { PrismaClient, Prisma } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';

export const getCurrentAdminUser = async (
  context: any,
  prisma: PrismaClient,
): Promise<{ id: number } | null> => {
  const email = (context?.currentAdmin?.email as string) || '';
  if (!email) return null;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user ?? null;
};

export const logAudit = async (params: {
  context: any;
  prisma: PrismaClient;
  auditLogService: AuditLogService;
  entity: string;
  entityId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CONFIG';
  comment: string;
  changes?: Prisma.InputJsonValue;
  route: string;
}) => {
  const currentUser = await getCurrentAdminUser(params.context, params.prisma);
  if (!currentUser?.id) return;

  const safeChanges: Prisma.InputJsonValue =
    params.changes ?? ({} as Prisma.JsonObject);

  await params.auditLogService.log({
    userId: currentUser.id,
    action: params.action,
    entity: params.entity,
    entityId: params.entityId,
    comment: params.comment,
    changes: safeChanges,
    metadata: { route: params.route },
  });
};
