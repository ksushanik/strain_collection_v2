import { ResourceWithOptions } from 'adminjs';
import { Prisma, PrismaClient } from '@prisma/client';
import { mediaNavigation } from '../navigation';
import { logAudit } from '../helpers/audit';
import { AuditLogService } from '../../audit/audit-log.service';

type GetModelByName = (modelName: string) => any;

export interface MediaResourcesDeps {
  prisma: PrismaClient;
  getModelByName: GetModelByName;
  auditLogService: AuditLogService;
}

export const buildMediaResources = ({
  prisma,
  getModelByName,
  auditLogService,
}: MediaResourcesDeps): ResourceWithOptions[] => [
  {
    resource: { model: getModelByName('SamplePhoto'), client: prisma },
    options: {
      navigation: mediaNavigation,
      properties: {
        id: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        url: {
          isVisible: { list: true, filter: false, show: true, edit: false },
        },
        meta: {
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        createdAt: {
          isVisible: { list: true, filter: false, show: true, edit: false },
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
                entity: 'SamplePhoto',
                entityId: Number(id),
                action: 'CREATE',
                comment: 'AdminJS: create SamplePhoto',
                changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                route: 'admin/sample-photo/new',
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
                entity: 'SamplePhoto',
                entityId: Number(id),
                action: 'UPDATE',
                comment: 'AdminJS: edit SamplePhoto',
                changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                route: 'admin/sample-photo/edit',
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
                entity: 'SamplePhoto',
                entityId: id,
                action: 'DELETE',
                comment: 'AdminJS: delete SamplePhoto',
                changes: {} as Prisma.InputJsonValue,
                route: 'admin/sample-photo/delete',
              });
            }
            return response;
          },
        },
      },
    },
  } as ResourceWithOptions,

  {
    resource: { model: getModelByName('StrainPhoto'), client: prisma },
    options: {
      navigation: mediaNavigation,
      properties: {
        id: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        url: {
          isVisible: { list: true, filter: false, show: true, edit: false },
        },
        meta: {
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        createdAt: {
          isVisible: { list: true, filter: false, show: true, edit: false },
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
                entity: 'StrainPhoto',
                entityId: Number(id),
                action: 'CREATE',
                comment: 'AdminJS: create StrainPhoto',
                changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                route: 'admin/strain-photo/new',
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
                entity: 'StrainPhoto',
                entityId: Number(id),
                action: 'UPDATE',
                comment: 'AdminJS: edit StrainPhoto',
                changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                route: 'admin/strain-photo/edit',
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
                entity: 'StrainPhoto',
                entityId: id,
                action: 'DELETE',
                comment: 'AdminJS: delete StrainPhoto',
                changes: {} as Prisma.InputJsonValue,
                route: 'admin/strain-photo/delete',
              });
            }
            return response;
          },
        },
      },
    },
  } as ResourceWithOptions,
];
