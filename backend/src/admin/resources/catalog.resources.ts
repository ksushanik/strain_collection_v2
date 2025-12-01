import { ResourceWithOptions } from 'adminjs';
import { Prisma, PrismaClient } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { catalogNavigation } from '../navigation';
import { logAudit } from '../helpers/audit';

type GetModelByName = (modelName: string) => any;

export interface CatalogResourcesDeps {
  prisma: PrismaClient;
  getModelByName: GetModelByName;
  auditLogService: AuditLogService;
}

export const buildCatalogResources = ({
  prisma,
  getModelByName,
  auditLogService,
}: CatalogResourcesDeps): ResourceWithOptions[] => [
  {
    resource: { model: getModelByName('Strain'), client: prisma },
    options: {
      navigation: catalogNavigation,
      properties: {
        id: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        identifier: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        cultivationConditions: {
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        notes: {
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
                entity: 'Strain',
                entityId: Number(id),
                action: 'CREATE',
                comment: 'AdminJS: create Strain',
                changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                route: 'admin/strains/new',
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
                entity: 'Strain',
                entityId: Number(id),
                action: 'UPDATE',
                comment: 'AdminJS: edit Strain',
                changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                route: 'admin/strains/edit',
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
                entity: 'Strain',
                entityId: id,
                action: 'DELETE',
                comment: 'AdminJS: delete Strain',
                changes: {} as Prisma.InputJsonValue,
                route: 'admin/strains/delete',
              });
            }
            return response;
          },
        },
      },
    },
  } as ResourceWithOptions,

  {
    resource: { model: getModelByName('Sample'), client: prisma },
    options: {
      navigation: catalogNavigation,
      properties: {
        id: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        code: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        sampleType: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        siteName: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        lat: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        lng: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        description: {
          isVisible: { list: true, filter: false, show: true, edit: true },
        },
        collectedAt: {
          isVisible: { list: true, filter: false, show: true, edit: true },
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
                entity: 'Sample',
                entityId: Number(id),
                action: 'CREATE',
                comment: 'AdminJS: create Sample',
                changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                route: 'admin/samples/new',
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
                entity: 'Sample',
                entityId: Number(id),
                action: 'UPDATE',
                comment: 'AdminJS: edit Sample',
                changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                route: 'admin/samples/edit',
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
                entity: 'Sample',
                entityId: id,
                action: 'DELETE',
                comment: 'AdminJS: delete Sample',
                changes: {} as Prisma.InputJsonValue,
                route: 'admin/samples/delete',
              });
            }
            return response;
          },
        },
      },
    },
  } as ResourceWithOptions,
];
