import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type Subjects =
  | 'Strain'
  | 'Sample'
  | 'Storage'
  | 'Media'
  | 'Settings'
  | 'Legend'
  | 'Analytics'
  | 'User'
  | 'Group'
  | 'AuditLog'
  | 'Photo'
  | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;

type PermissionMap = Partial<Record<Subjects, Actions[]>>;

const VALID_ACTIONS: Actions[] = ['manage', 'create', 'read', 'update', 'delete'];
const VALID_SUBJECTS: Subjects[] = [
  'Strain',
  'Sample',
  'Storage',
  'Media',
  'Settings',
  'Legend',
  'Analytics',
  'User',
  'Group',
  'AuditLog',
  'Photo',
  'all',
];

type RoleKey = 'ADMIN' | 'MANAGER' | 'USER';

const DEFAULT_ROLE_PERMISSIONS: Record<RoleKey, PermissionMap> = {
  ADMIN: { all: ['manage'] },
  MANAGER: {
    Strain: ['read', 'create', 'update', 'delete'],
    Sample: ['read', 'create', 'update', 'delete'],
    Storage: ['read', 'create', 'update', 'delete'],
    Photo: ['read', 'create', 'update', 'delete'],
    Media: ['read', 'create', 'update', 'delete'],
    Settings: ['read'],
    Legend: ['read'],
    Analytics: ['read'],
    User: ['read'],
    Group: ['read'],
  },
  USER: {
    Strain: ['read', 'create', 'update'],
    Sample: ['read', 'create', 'update'],
    Photo: ['read', 'create', 'update'],
    Storage: ['read'],
    Media: ['read'],
    Analytics: ['read'],
    Legend: ['read'],
    Settings: ['read'],
  },
};

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: Partial<User> & { role?: { key?: string }; roleId?: number }) {
    const { can, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    const roleKey =
      (user.role as any)?.key ??
      (typeof (user as any).role === 'string' ? (user as any).role : null);

    if (roleKey === 'ADMIN') {
      can('manage', 'all');
      return build();
    }

    const groupPermissionsRaw = (user as any)?.group?.permissions;
    const normalizedGroupPermissions =
      groupPermissionsRaw === null || groupPermissionsRaw === undefined
        ? null
        : this.normalizePermissions(groupPermissionsRaw as PermissionMap | null);

    const rolePermissionsRaw = (user as any)?.role?.permissions;
    const normalizedRolePermissions =
      rolePermissionsRaw === null || rolePermissionsRaw === undefined
        ? null
        : this.normalizePermissions(rolePermissionsRaw as PermissionMap | null);

    const useGroupPermissions =
      normalizedGroupPermissions !== null &&
      Object.keys(normalizedGroupPermissions).length > 0;

    const useRolePermissions =
      !useGroupPermissions &&
      normalizedRolePermissions !== null &&
      Object.keys(normalizedRolePermissions).length > 0;

    const permissions: PermissionMap = useGroupPermissions
      ? (normalizedGroupPermissions as PermissionMap)
      : useRolePermissions
        ? (normalizedRolePermissions as PermissionMap)
        : DEFAULT_ROLE_PERMISSIONS[(roleKey as RoleKey) ?? 'USER'] || {};

    this.applyPermissions(can, permissions);

    return build();
  }

  private normalizePermissions(raw: PermissionMap | null): PermissionMap | null {
    if (raw === null) {
      return null;
    }

    if (typeof raw !== 'object') {
      return {};
    }

    const normalized: PermissionMap = {};

    Object.entries(raw).forEach(([subject, actions]) => {
      if (!VALID_SUBJECTS.includes(subject as Subjects)) return;
      if (!Array.isArray(actions)) return;

      const filtered = actions.filter((action): action is Actions =>
        VALID_ACTIONS.includes(action as Actions),
      );

      if (filtered.length > 0) {
        normalized[subject as Subjects] = filtered;
      }
    });

    return normalized;
  }

  private applyPermissions(
    can: AbilityBuilder<AppAbility>['can'],
    permissions: PermissionMap,
  ) {
    Object.entries(permissions).forEach(([subject, actions]) => {
      actions?.forEach((action) => {
        if (VALID_ACTIONS.includes(action)) {
          can(action, subject as Subjects);
        }
      });
    });
  }
}
