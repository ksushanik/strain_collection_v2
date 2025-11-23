import { ResourceWithOptions } from 'adminjs';
import { PrismaClient } from '@prisma/client';
import { SettingsService } from '../settings/settings.service';
import { AuditLogService } from '../audit/audit-log.service';

export const createAdminOptions = (
  prisma: PrismaClient,
  getModelByName: (modelName: string) => any,
  settingsService: SettingsService,
  auditLogService: AuditLogService,
) => {
  return {
    rootPath: '/admin',
    branding: {
      companyName: 'Strain Collection',
      softwareBrothers: false,
    },
    resources: [
      // Users Management
      {
        resource: { model: getModelByName('User'), client: prisma },
        options: {
          navigation: {
            name: 'Управление пользователями',
            icon: 'User',
          },
          properties: {
            password: {
              isVisible: {
                list: false,
                filter: false,
                show: false,
                edit: true,
              },
            },
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            email: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            name: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            role: {
              isVisible: { list: true, filter: true, show: true, edit: true },
              availableValues: [
                { value: 'USER', label: 'User' },
                { value: 'MANAGER', label: 'Manager' },
                { value: 'ADMIN', label: 'Admin' },
              ],
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

      // Groups Management
      {
        resource: { model: getModelByName('Group'), client: prisma },
        options: {
          navigation: {
            name: 'Управление пользователями',
            icon: 'Users',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            name: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            description: {
              isVisible: { list: true, filter: false, show: true, edit: true },
            },
          },
        },
      } as ResourceWithOptions,

      // Strains Management
      {
        resource: { model: getModelByName('Strain'), client: prisma },
        options: {
          navigation: {
            name: 'Коллекция',
            icon: 'Microscope',
          },
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
        },
      } as ResourceWithOptions,

      // Samples Management
      {
        resource: { model: getModelByName('Sample'), client: prisma },
        options: {
          navigation: {
            name: 'Коллекция',
            icon: 'FlaskConical',
          },
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
        },
      } as ResourceWithOptions,

      // Settings
      {
        resource: { model: getModelByName('UiBinding'), client: prisma },
        options: {
          navigation: {
            name: 'Настройки',
            icon: 'Settings',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            menuLabel: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            profileKey: {
              isVisible: { list: true, filter: true, show: true, edit: true },
              availableValues: [
                { value: 'SAMPLE', label: 'Sample' },
                { value: 'STRAIN', label: 'Strain' },
                { value: 'MEDIA', label: 'Media' },
                { value: 'STORAGE', label: 'Storage' },
              ],
            },
            order: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            legendId: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            routeSlug: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            icon: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            enabledFieldPacks: { type: 'mixed', isArray: true },
            updatedAt: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
          },
          actions: {
            new: {
              handler: async (request: any, response: any, context: any) => {
                const params = request?.payload ?? {};
                const admin = context.currentAdmin;
                const email = (admin?.email as string) || undefined;
                const user = email
                  ? await prisma.user.findUnique({ where: { email } })
                  : null;
                const created = await settingsService.createUiBinding({
                  menuLabel: params.menuLabel,
                  profileKey: params.profileKey,
                  icon: params.icon,
                  enabledFieldPacks: params.enabledFieldPacks,
                  routeSlug: params.routeSlug,
                  order: params.order,
                  legendId: params.legendId,
                } as any);
                if (user?.id) {
                  await auditLogService.log({
                    userId: user.id,
                    action: 'CONFIG',
                    entity: 'UiBinding',
                    entityId: created.id,
                    comment: 'AdminJS: create UiBinding',
                    changes: params,
                    metadata: { route: 'admin/ui-binding/new' },
                  });
                }
                return {
                  record: { params: { ...created } },
                };
              },
            },
            edit: {
              handler: async (request: any, response: any, context: any) => {
                const params = request?.payload ?? {};
                const id = Number(request?.params?.recordId ?? params.id);
                const updated = await settingsService.updateUiBinding(
                  id,
                  params,
                );
                const admin = context.currentAdmin;
                const email = (admin?.email as string) || undefined;
                const user = email
                  ? await prisma.user.findUnique({ where: { email } })
                  : null;
                if (user?.id) {
                  await auditLogService.log({
                    userId: user.id,
                    action: 'CONFIG',
                    entity: 'UiBinding',
                    entityId: id,
                    comment: 'AdminJS: edit UiBinding',
                    changes: params,
                    metadata: { route: 'admin/ui-binding/edit' },
                  });
                }
                return {
                  record: { params: { ...updated } },
                };
              },
            },
            delete: {
              handler: async (request: any, response: any, context: any) => {
                const id = Number(request?.params?.recordId ?? 0);
                await settingsService.deleteUiBinding(id);
                const admin = context.currentAdmin;
                const email = (admin?.email as string) || undefined;
                const user = email
                  ? await prisma.user.findUnique({ where: { email } })
                  : null;
                if (user?.id) {
                  await auditLogService.log({
                    userId: user.id,
                    action: 'CONFIG',
                    entity: 'UiBinding',
                    entityId: id,
                    comment: 'AdminJS: delete UiBinding',
                    changes: {},
                    metadata: { route: 'admin/ui-binding/delete' },
                  });
                }
                return {
                  notice: { message: 'Deleted', type: 'success' },
                };
              },
            },
          },
        },
      } as ResourceWithOptions,

      {
        resource: { model: getModelByName('LegendContent'), client: prisma },
        options: {
          navigation: {
            name: 'Настройки',
            icon: 'Settings',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            content: {
              isVisible: { list: false, filter: false, show: true, edit: true },
            },
            updatedAt: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
          },
          actions: {
            new: {
              handler: async (request: any, response: any, context: any) => {
                const params = request?.payload ?? {};
                const created = await settingsService.updateLegend({
                  content: params.content,
                });
                const admin = context.currentAdmin;
                const email = (admin?.email as string) || undefined;
                const user = email
                  ? await prisma.user.findUnique({ where: { email } })
                  : null;
                if (user?.id) {
                  await auditLogService.log({
                    userId: user.id,
                    action: 'CONFIG',
                    entity: 'LegendContent',
                    entityId: created.id,
                    comment: 'AdminJS: create LegendContent',
                    changes: params,
                    metadata: { route: 'admin/legend/new' },
                  });
                }
                return { record: { params: { ...created } } };
              },
            },
            edit: {
              handler: async (request: any, response: any, context: any) => {
                const params = request?.payload ?? {};
                const updated = await settingsService.updateLegend({
                  content: params.content,
                });
                const admin = context.currentAdmin;
                const email = (admin?.email as string) || undefined;
                const user = email
                  ? await prisma.user.findUnique({ where: { email } })
                  : null;
                if (user?.id) {
                  await auditLogService.log({
                    userId: user.id,
                    action: 'CONFIG',
                    entity: 'LegendContent',
                    entityId: updated.id,
                    comment: 'AdminJS: edit LegendContent',
                    changes: params,
                    metadata: { route: 'admin/legend/edit' },
                  });
                }
                return { record: { params: { ...updated } } };
              },
            },
            delete: {
              handler: async (request: any, response: any, context: any) => {
                const id = Number(request?.params?.recordId ?? 0);
                await settingsService.deleteLegend(id);
                const admin = context.currentAdmin;
                const email = (admin?.email as string) || undefined;
                const user = email
                  ? await prisma.user.findUnique({ where: { email } })
                  : null;
                if (user?.id) {
                  await auditLogService.log({
                    userId: user.id,
                    action: 'CONFIG',
                    entity: 'LegendContent',
                    entityId: id,
                    comment: 'AdminJS: delete LegendContent',
                    changes: {},
                    metadata: { route: 'admin/legend/delete' },
                  });
                }
                return { notice: { message: 'Deleted', type: 'success' } };
              },
            },
          },
        },
      } as ResourceWithOptions,

      // Audit (read-only)
      {
        resource: { model: getModelByName('AuditLog'), client: prisma },
        options: {
          navigation: { name: 'Аудит', icon: 'Activity' },
          actions: {
            new: { isAccessible: () => false },
            edit: { isAccessible: () => false },
            delete: { isAccessible: () => false },
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            userId: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            action: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            entity: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            entityId: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            batchId: {
              isVisible: { list: false, filter: true, show: true, edit: false },
            },
            comment: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            changes: { type: 'mixed' },
            metadata: { type: 'mixed' },
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
          },
        },
      } as ResourceWithOptions,

      // Storage Management
      {
        resource: { model: getModelByName('StorageBox'), client: prisma },
        options: {
          navigation: {
            name: 'Хранение',
            icon: 'Box',
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
          navigation: {
            name: 'Хранение',
            icon: 'Package',
          },
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
        },
      } as ResourceWithOptions,

      // Photo Management
      {
        resource: { model: getModelByName('SamplePhoto'), client: prisma },
        options: {
          navigation: {
            name: 'Медиа',
            icon: 'Image',
          },
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
        },
      } as ResourceWithOptions,
    ],
    databases: [],
  };
};
