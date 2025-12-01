import { ResourceWithOptions } from 'adminjs';
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
          after: async (response: any, request: any, context: any) => {
            const id =
              Number(request?.params?.recordId ?? 0) ||
              Number(response?.record?.params?.id ?? 0);
            if (id) {
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
            }
            return response;
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
