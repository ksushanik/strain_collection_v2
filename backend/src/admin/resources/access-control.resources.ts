import { ResourceWithOptions } from 'adminjs';
import { Prisma, PrismaClient } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { accessControlNavigation } from '../navigation';
import {
  hashPasswordBefore,
  stripPasswordFromResponse,
} from '../helpers/password';
import { normalizePermissionsBefore } from '../helpers/permissions';
import { logAudit } from '../helpers/audit';

const normalizeUserRelationsBefore = (request: any) => {
  if (request?.method !== 'post' || !request?.payload) return request;
  const payload = { ...request.payload };

  if (Object.prototype.hasOwnProperty.call(payload, 'roleId')) {
    const rawRoleId = payload.roleId;
    if (rawRoleId === '' || rawRoleId === null || rawRoleId === undefined) {
      delete payload.roleId;
    } else if (typeof rawRoleId === 'string') {
      const parsed = Number(rawRoleId);
      if (Number.isFinite(parsed)) {
        payload.roleId = parsed;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'groupId')) {
    const rawGroupId = payload.groupId;
    if (rawGroupId === '' || rawGroupId === null || rawGroupId === undefined) {
      payload.groupId = null;
    } else if (typeof rawGroupId === 'string') {
      const parsed = Number(rawGroupId);
      if (Number.isFinite(parsed)) {
        payload.groupId = parsed;
      }
    }
  }

  return { ...request, payload };
};

const normalizeUserBefore = async (request: any) =>
  normalizeUserRelationsBefore(await hashPasswordBefore(request));

type GetModelByName = (modelName: string) => any;

export interface AccessControlResourcesDeps {
  prisma: PrismaClient;
  getModelByName: GetModelByName;
  auditLogService: AuditLogService;
  permissionsComponent: any;
}

export const buildAccessControlResources = ({
  prisma,
  getModelByName,
  auditLogService,
  permissionsComponent,
}: AccessControlResourcesDeps): ResourceWithOptions[] => [
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
          before: normalizeUserBefore,
          after: async (response: any, request: any, context: any) => {
            stripPasswordFromResponse(response);
            const id = response?.record?.params?.id;
            if (id) {
              const { password: passwordToOmit, ...changes } =
                request?.payload ?? {};
              void passwordToOmit;
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
          before: normalizeUserBefore,
          after: async (response: any, request: any, context: any) => {
            stripPasswordFromResponse(response);
            const id =
              response?.record?.params?.id ??
              Number(request?.params?.recordId ?? 0);
            if (id) {
              const { password: passwordToOmit, ...changes } =
                request?.payload ?? {};
              void passwordToOmit;
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

  {
    resource: { model: getModelByName('Role'), client: prisma },
    options: {
      navigation: accessControlNavigation,
      listProperties: ['id', 'key', 'name', 'description', 'updatedAt'],
      filterProperties: ['key', 'name', 'updatedAt'],
      editProperties: ['key', 'name', 'description', 'permissions'],
      showProperties: [
        'id',
        'key',
        'name',
        'description',
        'permissions',
        'createdAt',
        'updatedAt',
      ],
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
            'JSON формат прав, пример. {"Strain":["read","update"],"Sample":["read"]}. Пустой объект = прав нет (рекомендуется явно).',
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

  {
    resource: { model: getModelByName('Group'), client: prisma },
    options: {
      navigation: accessControlNavigation,
      listProperties: ['id', 'name', 'description', 'updatedAt'],
      filterProperties: ['name', 'updatedAt'],
      editProperties: ['name', 'description', 'permissions'],
      showProperties: [
        'id',
        'name',
        'description',
        'permissions',
        'createdAt',
        'updatedAt',
      ],
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
            'JSON формат прав, пример. {"Strain":["read","update"],"Sample":["read"]}. Пустой объект = прав нет.',
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
];
