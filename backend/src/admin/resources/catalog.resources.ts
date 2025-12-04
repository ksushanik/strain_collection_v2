import {
  ResourceWithOptions,
  type ActionContext,
  type ActionRequest,
  type ActionResponse,
} from 'adminjs';
import { Prisma, PrismaClient, CellStatus } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { catalogNavigation } from '../navigation';
import { logAudit } from '../helpers/audit';

type GetModelByName = (modelName: string) => any;

export interface CatalogResourcesDeps {
  prisma: PrismaClient;
  getModelByName: GetModelByName;
  auditLogService: AuditLogService;
}

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
        bulkDelete: {
          actionType: 'bulk',
          icon: 'Trash',
          label: 'Delete selected',
          guard: 'Are you sure you want to delete selected strains?',
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
                notice: {
                  message: 'No records selected',
                  type: 'error',
                },
                records: [],
              };
            }

            let success = 0;
            let failed = 0;

            for (const id of ids) {
              try {
                const strain = await prisma.strain.findUnique({
                  where: { id },
                  include: { storage: true },
                });
                if (!strain) {
                  failed += 1;
                  continue;
                }

                await prisma.$transaction(async (tx) => {
                  for (const allocation of strain.storage) {
                    await tx.storageCell.update({
                      where: { id: allocation.cellId },
                      data: { status: CellStatus.FREE },
                    });
                    await tx.strainStorage.delete({
                      where: { id: allocation.id },
                    });
                  }
                  await tx.strainMedia.deleteMany({ where: { strainId: id } });
                  await tx.strain.delete({ where: { id } });
                });

                await logAudit({
                  context,
                  prisma,
                  auditLogService,
                  entity: 'Strain',
                  entityId: id,
                  action: 'DELETE',
                  comment: 'AdminJS: bulk delete Strain',
                  changes: { bulk: true, ids } as Prisma.InputJsonValue,
                  route: 'admin/strains/bulk-delete',
                });
                success += 1;
              } catch (error: any) {
                console.error('Bulk delete strain failed', { id, error });
                failed += 1;
              }
            }

            const queryPage = (request?.query as any)?.page;
            const redirectUrl =
              typeof queryPage !== 'undefined'
                ? `${context.h.resourceActionUrl({
                    resourceId: context.resource.id(),
                    actionName: 'list',
                  })}?page=${queryPage}`
                : context.h.resourceActionUrl({
                    resourceId: context.resource.id(),
                    actionName: 'list',
                  });

            return {
              notice: {
                message: `Deleted ${success} strains${failed ? `, failed ${failed}` : ''}`,
                type: failed ? 'error' : 'success',
              },
              redirectUrl,
              records: [],
            };
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
        bulkDelete: {
          actionType: 'bulk',
          icon: 'Trash',
          label: 'Delete selected',
          guard: 'Are you sure you want to delete selected samples?',
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
                notice: {
                  message: 'No records selected',
                  type: 'error',
                },
                records: [],
              };
            }

            let success = 0;
            let failed = 0;

            for (const id of ids) {
              try {
                const sample = await prisma.sample.findUnique({
                  where: { id },
                  include: { strains: true },
                });
                if (!sample) {
                  failed += 1;
                  continue;
                }

                await prisma.$transaction(async (tx) => {
                  // Collect strain ids to cascade delete allocations/media/photos
                  const strainIds = sample.strains.map((s) => s.id);

                  // Clean storage for strains linked to this sample
                  const allocations = await tx.strainStorage.findMany({
                    where: { strainId: { in: strainIds } },
                  });
                  for (const alloc of allocations) {
                    await tx.storageCell.update({
                      where: { id: alloc.cellId },
                      data: { status: CellStatus.FREE },
                    });
                    await tx.strainStorage.delete({ where: { id: alloc.id } });
                  }

                  // Delete strain media links and strains themselves
                  if (strainIds.length) {
                    await tx.strainMedia.deleteMany({
                      where: { strainId: { in: strainIds } },
                    });
                    await tx.strainPhoto.deleteMany({
                      where: { strainId: { in: strainIds } },
                    });
                    await tx.strain.deleteMany({
                      where: { id: { in: strainIds } },
                    });
                  }

                  await tx.samplePhoto.deleteMany({ where: { sampleId: id } });
                  await tx.sample.delete({ where: { id } });
                });

                await logAudit({
                  context,
                  prisma,
                  auditLogService,
                  entity: 'Sample',
                  entityId: id,
                  action: 'DELETE',
                  comment: 'AdminJS: bulk delete Sample',
                  changes: { bulk: true, ids } as Prisma.InputJsonValue,
                  route: 'admin/samples/bulk-delete',
                });
                success += 1;
              } catch (error: any) {
                console.error('Bulk delete sample failed', { id, error });
                failed += 1;
              }
            }

            const queryPage = (request?.query as any)?.page;
            const redirectUrl =
              typeof queryPage !== 'undefined'
                ? `${context.h.resourceActionUrl({
                    resourceId: context.resource.id(),
                    actionName: 'list',
                  })}?page=${queryPage}`
                : context.h.resourceActionUrl({
                    resourceId: context.resource.id(),
                    actionName: 'list',
                  });

            return {
              notice: {
                message: `Deleted ${success} samples${failed ? `, failed ${failed}` : ''}`,
                type: failed ? 'error' : 'success',
              },
              redirectUrl,
              records: [],
            };
          },
        },
      },
    },
  } as ResourceWithOptions,

  // Supporting dictionary to unblock Sample filters/reference search in AdminJS
  {
    resource: { model: getModelByName('SampleTypeDictionary'), client: prisma },
    options: {
      navigation: catalogNavigation,
      properties: {
        id: {
          isVisible: { list: true, filter: false, show: true, edit: false },
        },
        name: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        slug: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        samples: { isVisible: false },
      },
      actions: {
        new: { isVisible: true },
        edit: { isVisible: true },
        delete: { isVisible: true },
        show: { isVisible: true },
        list: { isVisible: true },
      },
    },
  } as ResourceWithOptions,
];
