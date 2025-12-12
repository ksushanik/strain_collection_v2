import {
  ResourceWithOptions,
  type ActionContext,
  type ActionRequest,
  type ActionResponse,
} from 'adminjs';
import { Prisma, PrismaClient } from '@prisma/client';
import { storageNavigation } from '../navigation';
import { syncStorageBoxCells } from '../helpers/storage';
import { logAudit } from '../helpers/audit';
import { AuditLogService } from '../../audit/audit-log.service';

type GetModelByName = (modelName: string) => any;

export interface StorageResourcesDeps {
  prisma: PrismaClient;
  getModelByName: GetModelByName;
  auditLogService: AuditLogService;
}

const coerceRowsCols = (request: any) => {
  if (request?.method !== 'post' || !request?.payload) return request;
  const payload = { ...request.payload };
  if (payload.rows) payload.rows = Number(payload.rows);
  if (payload.cols) payload.cols = Number(payload.cols);
  return { ...request, payload };
};

const normalizeIds = (value: unknown): number[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((id) => Number(id)).filter((n) => Number.isFinite(n));
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((n) => Number.isFinite(n));
  }
  return [];
};

const getIdsFromRequest = (request: ActionRequest) => {
  const ids =
    normalizeIds((request?.query as any)?.recordIds) ||
    normalizeIds((request?.payload as any)?.recordIds);
  return ids;
};

const deleteBoxWithCells = async (
  prisma: PrismaClient,
  boxId: number,
): Promise<{ id: number; displayName: string }> => {
  const box = await prisma.storageBox.findUnique({
    where: { id: boxId },
    include: {
      cells: {
        select: { id: true },
      },
    },
  });

  if (!box) {
    throw new Error(`Storage box ${boxId} not found`);
  }

  const cellIds = box.cells.map((c) => c.id);

  await prisma.$transaction(async (tx) => {
    // Снимаем все аллокации и удаляем клетки вместе с боксом
    if (cellIds.length) {
      await tx.strainStorage.deleteMany({ where: { cellId: { in: cellIds } } });
      await tx.storageCell.deleteMany({ where: { id: { in: cellIds } } });
    }
    await tx.storageBox.delete({ where: { id: boxId } });
  });

  return { id: box.id, displayName: box.displayName };
};

const listRedirectUrl = (
  context: ActionContext,
  request: ActionRequest,
): string => {
  const queryPage = (request?.query as any)?.page;
  return typeof queryPage !== 'undefined'
    ? `${context.h.resourceActionUrl({
        resourceId: context.resource.id(),
        actionName: 'list',
      })}?page=${queryPage}`
    : context.h.resourceActionUrl({
        resourceId: context.resource.id(),
        actionName: 'list',
      });
};

export const buildStorageResources = ({
  prisma,
  getModelByName,
  auditLogService,
}: StorageResourcesDeps): ResourceWithOptions[] => [
  {
    resource: { model: getModelByName('StorageBox'), client: prisma },
    options: {
      navigation: storageNavigation,
      actions: {
        new: {
          before: coerceRowsCols,
          after: async (response: any, request: any, context: any) => {
            const id = Number(response?.record?.params?.id ?? 0);
            const rows = Number(response?.record?.params?.rows ?? 0);
            const cols = Number(response?.record?.params?.cols ?? 0);
            if (id && rows && cols) {
              await syncStorageBoxCells(prisma, id, rows, cols);
            }
            if (id) {
              await logAudit({
                context,
                prisma,
                auditLogService,
                entity: 'StorageBox',
                entityId: id,
                action: 'CREATE',
                comment: 'AdminJS: create StorageBox',
                changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                route: 'admin/storage-box/new',
              });
            }
            return response;
          },
        },
        edit: {
          before: coerceRowsCols,
          after: async (response: any, request: any, context: any) => {
            const id =
              Number(request?.params?.recordId ?? 0) ||
              Number(response?.record?.params?.id ?? 0);
            const rows = Number(
              response?.record?.params?.rows ?? request?.payload?.rows ?? 0,
            );
            const cols = Number(
              response?.record?.params?.cols ?? request?.payload?.cols ?? 0,
            );
            if (id && rows && cols) {
              await syncStorageBoxCells(prisma, id, rows, cols);
            }
            if (id) {
              await logAudit({
                context,
                prisma,
                auditLogService,
                entity: 'StorageBox',
                entityId: id,
                action: 'UPDATE',
                comment: 'AdminJS: edit StorageBox',
                changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                route: 'admin/storage-box/edit',
              });
            }
            return response;
          },
        },
        delete: {
          actionType: 'record',
          icon: 'Trash',
          guard:
            'Are you sure you want to delete this storage box? All its cells will be removed.',
          isAccessible: () => true,
          component: false,
          showInDrawer: false,
          handler: async (
            request: ActionRequest,
            _response: ActionResponse,
            context: ActionContext,
          ) => {
            const id = Number(request?.params?.recordId ?? 0);
            if (!id) {
              return {
                notice: { message: 'Invalid storage box id', type: 'error' },
                record: null,
              };
            }

            try {
              const deletedBox = await deleteBoxWithCells(prisma, id);

              await logAudit({
                context,
                prisma,
                auditLogService,
                entity: 'StorageBox',
                entityId: id,
                action: 'DELETE',
                comment: 'AdminJS: delete StorageBox',
                changes: {} as Prisma.InputJsonValue,
                route: 'admin/storage-box/delete',
              });

              return {
                notice: {
                  message: `Deleted storage box "${deletedBox.displayName}" (${id})`,
                  type: 'success',
                },
                redirectUrl: listRedirectUrl(context, request),
                record: null,
              };
            } catch (error: any) {
              console.error('Delete storage box failed', { id, error });
              return {
                notice: {
                  message:
                    error?.message ?? 'Failed to delete storage box, see logs',
                  type: 'error',
                },
                record: null,
              };
            }
          },
        },
        bulkDelete: {
          actionType: 'bulk',
          icon: 'Trash',
          label: 'Delete selected',
          guard: 'Are you sure you want to delete selected storage boxes?',
          isAccessible: () => true,
          component: false,
          showInDrawer: false,
          handler: async (
            request: ActionRequest,
            _response: ActionResponse,
            context: ActionContext,
          ) => {
            const ids = getIdsFromRequest(request);
            if (!ids.length) {
              return {
                notice: { message: 'No records selected', type: 'error' },
                records: [],
              };
            }

            let success = 0;
            let failed = 0;
            const errors: string[] = [];

            for (const id of ids) {
              try {
                await deleteBoxWithCells(prisma, id);

                await logAudit({
                  context,
                  prisma,
                  auditLogService,
                  entity: 'StorageBox',
                  entityId: id,
                  action: 'DELETE',
                  comment: 'AdminJS: bulk delete StorageBox',
                  changes: { bulk: true, ids } as Prisma.InputJsonValue,
                  route: 'admin/storage-box/bulk-delete',
                });

                success += 1;
              } catch (error: any) {
                failed += 1;
                const message =
                  error?.message ?? `Failed to delete storage box ${id}`;
                errors.push(`Box ${id}: ${message}`);
                console.error('Bulk delete storage box failed', {
                  id,
                  error,
                });
              }
            }

            return {
              notice: {
                message: `Deleted ${success} storage box(es)${
                  failed ? `, failed ${failed}: ${errors.join('; ')}` : ''
                }`,
                type: failed ? 'error' : 'success',
              },
              redirectUrl: listRedirectUrl(context, request),
              records: [],
            };
          },
        },
      },
      properties: {
        id: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        displayName: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        rows: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        cols: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        description: {
          isVisible: { list: true, filter: false, show: true, edit: true },
        },
        createdAt: {
          isVisible: { list: true, filter: false, show: true, edit: false },
        },
        updatedAt: {
          isVisible: {
            list: false,
            filter: false,
            show: true,
            edit: false,
          },
        },
      },
    },
  } as ResourceWithOptions,

  {
    resource: { model: getModelByName('StorageCell'), client: prisma },
    options: {
      navigation: storageNavigation,
      properties: {
        id: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        boxId: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        row: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        col: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        cellCode: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        status: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
      },
      actions: {
        new: {
          after: async (response: any, request: any, context: any) => {
            const id = response?.record?.params?.id;
            if (id) {
              await logAudit({
                context,
                prisma,
                auditLogService,
                entity: 'StorageCell',
                entityId: Number(id),
                action: 'CREATE',
                comment: 'AdminJS: create StorageCell',
                changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                route: 'admin/storage-cell/new',
              });
            }
            return response;
          },
        },
        edit: {
          after: async (response: any, request: any, context: any) => {
            const id =
              response?.record?.params?.id ??
              Number(request?.params?.recordId ?? 0);
            if (id) {
              await logAudit({
                context,
                prisma,
                auditLogService,
                entity: 'StorageCell',
                entityId: Number(id),
                action: 'UPDATE',
                comment: 'AdminJS: edit StorageCell',
                changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                route: 'admin/storage-cell/edit',
              });
            }
            return response;
          },
        },
        delete: {
          after: async (response: any, request: any, context: any) => {
            const id =
              Number(request?.params?.recordId ?? 0) ||
              Number(response?.record?.params?.id ?? 0);
            if (id) {
              await logAudit({
                context,
                prisma,
                auditLogService,
                entity: 'StorageCell',
                entityId: id,
                action: 'DELETE',
                comment: 'AdminJS: delete StorageCell',
                changes: {} as Prisma.InputJsonValue,
                route: 'admin/storage-cell/delete',
              });
            }
            return response;
          },
        },
      },
    },
  } as ResourceWithOptions,
];
