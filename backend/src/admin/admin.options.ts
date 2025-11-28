import { ResourceWithOptions } from 'adminjs';
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SettingsService } from '../settings/settings.service';
import { AuditLogService } from '../audit/audit-log.service';

const accessControlNavigation = { name: 'Access Control', icon: 'Shield' };
const catalogNavigation = { name: 'Catalog', icon: 'Microscope' };
const storageNavigation = { name: 'Storage', icon: 'Box' };
const configurationNavigation = { name: 'Configuration', icon: 'Settings' };
const mediaNavigation = { name: 'Media', icon: 'Image' };
const auditNavigation = { name: 'Audit', icon: 'Activity' };

const getCurrentAdminUser = async (
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

const logAudit = async (params: {
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

const hashPasswordBefore = async (request: any) => {
  if (request?.method !== 'post' || !request?.payload) return request;

  const payload = { ...request.payload };
  const password = payload.password;

  if (typeof password === 'string') {
    const trimmed = password.trim();
    if (trimmed.length === 0) {
      delete payload.password;
    } else {
      payload.password = await bcrypt.hash(trimmed, 10);
    }
  }

  return { ...request, payload };
};

const stripPasswordFromResponse = (response: any) => {
  if (response?.record?.params?.password !== undefined) {
    delete response.record.params.password;
  }
  return response;
};

const normalizePermissionsBefore = (request: any) => {
  if (request?.method !== 'post' || !request?.payload) return request;
  const payload = { ...request.payload };
  const rawPermissions = payload.permissions;

  if (Object.prototype.hasOwnProperty.call(payload, 'permissions')) {
    if (typeof rawPermissions === 'string') {
      try {
        payload.permissions = rawPermissions.trim()
          ? JSON.parse(rawPermissions)
          : {};
      } catch {
        payload.permissions = {};
      }
    } else if (rawPermissions === null || typeof rawPermissions !== 'object') {
      payload.permissions = {};
    }
  }

  return { ...request, payload };
};

const syncStorageBoxCells = async (
  prisma: PrismaClient,
  boxId: number,
  rows: number,
  cols: number,
) => {
  const normalizedRows = Number(rows);
  const normalizedCols = Number(cols);
  if (![9, 10].includes(normalizedRows) || ![9, 10].includes(normalizedCols)) {
    throw new Error('Rows and cols must be 9 or 10');
  }

  const existingCells = await prisma.storageCell.findMany({
    where: { boxId },
    select: { id: true, cellCode: true },
  });

  const existingByCode = new Map(
    existingCells.map((c) => [c.cellCode, c]),
  );

  const desired = Array.from(
    { length: normalizedRows * normalizedCols },
    (_, i) => {
      const row = Math.floor(i / normalizedCols) + 1;
      const col = (i % normalizedCols) + 1;
      return {
        row,
        col,
        cellCode: `${String.fromCharCode(65 + Math.floor(i / normalizedCols))}${(i % normalizedCols) + 1}`,
      };
    },
  );
  const desiredCodes = new Set(desired.map((d) => d.cellCode));

  const toDeleteIds = existingCells
    .filter((c) => !desiredCodes.has(c.cellCode))
    .map((c) => c.id);

  if (toDeleteIds.length) {
    await prisma.strainStorage.deleteMany({
      where: { cellId: { in: toDeleteIds } },
    });
    await prisma.storageCell.deleteMany({
      where: { id: { in: toDeleteIds } },
    });
  }

  const toCreate = desired.filter((d) => !existingByCode.has(d.cellCode));
  if (toCreate.length) {
    await prisma.storageCell.createMany({
      data: toCreate.map((d) => ({ ...d, boxId })),
    });
  }
};

export const createAdminOptions = (
  prisma: PrismaClient,
  getModelByName: (modelName: string) => any,
  settingsService: SettingsService,
  auditLogService: AuditLogService,
  permissionsComponent: any,
  jsonShowComponent: string,
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
          navigation: accessControlNavigation,
          listProperties: ['id', 'email', 'name', 'roleId', 'groupId', 'createdAt'],
          filterProperties: ['email', 'roleId', 'groupId', 'createdAt'],
          editProperties: ['email', 'name', 'roleId', 'groupId', 'password'],
          showProperties: [
            'id',
            'email',
            'name',
            'roleId',
            'groupId',
            'createdAt',
            'updatedAt',
          ],
          properties: {
            password: {
              isVisible: {
                list: false,
                filter: false,
                show: false,
                edit: true,
              },
              type: 'password',
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
            roleId: {
              isVisible: { list: true, filter: true, show: true, edit: true },
              reference: 'Role',
            },
            groupId: {
              isVisible: { list: true, filter: true, show: true, edit: true },
              reference: 'Group',
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
          actions: {
            new: {
              before: hashPasswordBefore,
              after: async (response: any, request: any, context: any) => {
                stripPasswordFromResponse(response);
                const id = response?.record?.params?.id;
                if (id) {
                  const { password, ...changes } = request?.payload ?? {};
                  await logAudit({
                    context,
                    prisma,
                    auditLogService,
                    entity: 'User',
                    entityId: Number(id),
                    action: 'CREATE',
                    comment: 'AdminJS: create User',
                    changes: changes as Prisma.InputJsonValue,
                    route: 'admin/users/new',
                  });
                }
                return response;
              },
            },
            edit: {
              before: hashPasswordBefore,
              after: async (response: any, request: any, context: any) => {
                stripPasswordFromResponse(response);
                const id =
                  response?.record?.params?.id ??
                  Number(request?.params?.recordId ?? 0);
                if (id) {
                  const { password, ...changes } = request?.payload ?? {};
                  await logAudit({
                    context,
                    prisma,
                    auditLogService,
                    entity: 'User',
                    entityId: Number(id),
                    action: 'UPDATE',
                    comment: 'AdminJS: edit User',
                    changes: changes as Prisma.InputJsonValue,
                    route: 'admin/users/edit',
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
                    entity: 'User',
                    entityId: id,
                    action: 'DELETE',
                    comment: 'AdminJS: delete User',
                    changes: {} as Prisma.InputJsonValue,
                    route: 'admin/users/delete',
                  });
                }
                return response;
              },
            },
          },
        },
      } as ResourceWithOptions,

      // Roles Management
      {
        resource: { model: getModelByName('Role'), client: prisma },
        options: {
          navigation: accessControlNavigation,
          listProperties: ['id', 'key', 'name', 'description', 'updatedAt'],
          filterProperties: ['key', 'name', 'updatedAt'],
          editProperties: ['key', 'name', 'description', 'permissions'],
          showProperties: ['id', 'key', 'name', 'description', 'permissions', 'createdAt', 'updatedAt'],
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            key: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            name: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            description: {
              isVisible: { list: true, filter: false, show: true, edit: true },
            },
            permissions: {
              type: 'mixed',
              isVisible: { list: false, filter: false, show: true, edit: true },
              description:
                'JSON карта прав роли, напр. {"Strain":["read","update"],"Sample":["read"]}. Пусто = роль без прав (используйте группу).',
              components: {
                edit: permissionsComponent,
              },
            },
            createdAt: {
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            updatedAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
          },
          actions: {
            new: {
              before: normalizePermissionsBefore,
              after: async (response: any, request: any, context: any) => {
                const id = response?.record?.params?.id;
                if (id) {
                  await logAudit({
                    context,
                    prisma,
                    auditLogService,
                    entity: 'Role',
                    entityId: Number(id),
                    action: 'CREATE',
                    comment: 'AdminJS: create Role',
                    changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                    route: 'admin/roles/new',
                  });
                }
                return response;
              },
            },
            edit: {
              before: normalizePermissionsBefore,
              after: async (response: any, request: any, context: any) => {
                const id =
                  response?.record?.params?.id ??
                  Number(request?.params?.recordId ?? 0);
                if (id) {
                  await logAudit({
                    context,
                    prisma,
                    auditLogService,
                    entity: 'Role',
                    entityId: Number(id),
                    action: 'UPDATE',
                    comment: 'AdminJS: edit Role',
                    changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                    route: 'admin/roles/edit',
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
                    entity: 'Role',
                    entityId: id,
                    action: 'DELETE',
                    comment: 'AdminJS: delete Role',
                    changes: {} as Prisma.InputJsonValue,
                    route: 'admin/roles/delete',
                  });
                }
                return response;
              },
            },
          },
        },
      } as ResourceWithOptions,

      // Groups Management
      {
        resource: { model: getModelByName('Group'), client: prisma },
        options: {
          navigation: accessControlNavigation,
          listProperties: ['id', 'name', 'description', 'updatedAt'],
          filterProperties: ['name', 'updatedAt'],
          editProperties: ['name', 'description', 'permissions'],
          showProperties: ['id', 'name', 'description', 'permissions', 'createdAt', 'updatedAt'],
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
            permissions: {
              type: 'mixed',
              isVisible: { list: false, filter: false, show: true, edit: true },
              description:
                'JSON карта прав, напр. {"Strain":["read","update"],"Sample":["read"]}. Пустое значение = права по роли.',
              components: {
                edit: permissionsComponent,
              },
            },
            createdAt: {
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            updatedAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
          },
          actions: {
            new: {
              before: normalizePermissionsBefore,
              after: async (response: any, request: any, context: any) => {
                const id = response?.record?.params?.id;
                if (id) {
                  await logAudit({
                    context,
                    prisma,
                    auditLogService,
                    entity: 'Group',
                    entityId: Number(id),
                    action: 'CREATE',
                    comment: 'AdminJS: create Group',
                    changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                    route: 'admin/groups/new',
                  });
                }
                return response;
              },
            },
            edit: {
              before: normalizePermissionsBefore,
              after: async (response: any, request: any, context: any) => {
                const id =
                  response?.record?.params?.id ??
                  Number(request?.params?.recordId ?? 0);
                if (id) {
                  await logAudit({
                    context,
                    prisma,
                    auditLogService,
                    entity: 'Group',
                    entityId: Number(id),
                    action: 'UPDATE',
                    comment: 'AdminJS: edit Group',
                    changes: (request?.payload ?? {}) as Prisma.InputJsonValue,
                    route: 'admin/groups/edit',
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
                    entity: 'Group',
                    entityId: id,
                    action: 'DELETE',
                    comment: 'AdminJS: delete Group',
                    changes: {} as Prisma.InputJsonValue,
                    route: 'admin/groups/delete',
                  });
                }
                return response;
              },
            },
          },
        },
      } as ResourceWithOptions,

      // Strains Management
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
                const id = response?.record?.params?.id ?? Number(request?.params?.recordId ?? 0);
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
                const id = Number(request?.params?.recordId ?? 0) || Number(response?.record?.params?.id ?? 0);
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

      // Samples Management
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
                const id = response?.record?.params?.id ?? Number(request?.params?.recordId ?? 0);
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
                const id = Number(request?.params?.recordId ?? 0) || Number(response?.record?.params?.id ?? 0);
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

      // Settings
      {
        resource: { model: getModelByName('UiBinding'), client: prisma },
        options: {
          navigation: configurationNavigation,
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
          navigation: configurationNavigation,
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
          navigation: auditNavigation,
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
              reference: 'User',
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
            changes: {
              type: 'mixed',
              isVisible: { list: false, filter: false, show: true, edit: false },
              components: {
                show: jsonShowComponent,
              },
            },
            metadata: {
              type: 'mixed',
              isVisible: { list: false, filter: false, show: true, edit: false },
              components: {
                show: jsonShowComponent,
              },
            },
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
          navigation: storageNavigation,
          actions: {
            new: {
              before: async (request: any) => {
                if (request?.method !== 'post' || !request?.payload) return request;
                const payload = { ...request.payload };
                if (payload.rows) payload.rows = Number(payload.rows);
                if (payload.cols) payload.cols = Number(payload.cols);
                return { ...request, payload };
              },
              after: async (response: any, request: any, context: any) => {
                const id = Number(response?.record?.params?.id ?? 0);
                const rows = Number(response?.record?.params?.rows ?? 0);
                const cols = Number(response?.record?.params?.cols ?? 0);
                if (id && rows && cols) {
                  await syncStorageBoxCells(prisma, id, rows, cols);
                }
                // Audit logging
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
              before: async (request: any) => {
                if (request?.method !== 'post' || !request?.payload) return request;
                const payload = { ...request.payload };
                if (payload.rows) payload.rows = Number(payload.rows);
                if (payload.cols) payload.cols = Number(payload.cols);
                return { ...request, payload };
              },
              after: async (response: any, request: any, context: any) => {
                const id =
                  Number(request?.params?.recordId ?? 0) ||
                  Number(response?.record?.params?.id ?? 0);
                const rows = Number(response?.record?.params?.rows ?? request?.payload?.rows ?? 0);
                const cols = Number(response?.record?.params?.cols ?? request?.payload?.cols ?? 0);
                if (id && rows && cols) {
                  await syncStorageBoxCells(prisma, id, rows, cols);
                }
                // Audit logging
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
                const id = response?.record?.params?.id ?? Number(request?.params?.recordId ?? 0);
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
                const id = Number(request?.params?.recordId ?? 0) || Number(response?.record?.params?.id ?? 0);
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

      // Photo Management
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
                const id = response?.record?.params?.id ?? Number(request?.params?.recordId ?? 0);
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
                const id = Number(request?.params?.recordId ?? 0) || Number(response?.record?.params?.id ?? 0);
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
                  response?.record?.params?.id ?? Number(request?.params?.recordId ?? 0);
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
    ],
    databases: [],
  };
};
