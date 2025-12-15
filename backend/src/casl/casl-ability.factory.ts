import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type Subjects =
  | 'Strain'
  | 'Sample'
  | 'Storage'
  | 'Media'
  | 'Method'
  | 'Settings'
  | 'Legend'
  | 'Analytics'
  | 'User'
  | 'Group'
  | 'AuditLog'
  | 'Photo'
  | 'TraitDefinition'
  | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;

type PermissionMap = Partial<Record<Subjects, Actions[]>>;

const VALID_ACTIONS: Actions[] = [
  'manage',
  'create',
  'read',
  'update',
  'delete',
];
const VALID_SUBJECTS: Subjects[] = [
  'Strain',
  'Sample',
  'Storage',
  'Media',
  'Method',
  'TraitDefinition',
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

const DEFAULT_ROLE_PERMISSIONS: Record<RoleKey | 'GUEST', PermissionMap> = {
  ADMIN: { all: ['manage'] },
  MANAGER: {
    Strain: ['read', 'create', 'update', 'delete'],
    Sample: ['read', 'create', 'update', 'delete'],
    Storage: ['read', 'create', 'update', 'delete'],
    Photo: ['read', 'create', 'update', 'delete'],
    Media: ['read', 'create', 'update', 'delete'],
    Method: ['read', 'create', 'update', 'delete'],
    TraitDefinition: ['read', 'create', 'update', 'delete'],
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
    Storage: ['read', 'create', 'update'],
    Media: ['read', 'create', 'update'],
    Method: ['read', 'create', 'update'],
    TraitDefinition: ['read', 'create', 'update'],
    Analytics: ['read'],
    Legend: ['read'],
    Settings: ['read'],
  },
  // Explicit GUEST role definition (read-only)
  GUEST: {
    Strain: ['read'],
    Sample: ['read'],
    Photo: ['read'],
    Storage: ['read'],
    Media: ['read'],
    Method: ['read'],
    TraitDefinition: ['read'],
    Analytics: ['read'],
    Legend: ['read'],
    Settings: ['read'],
  },
};

@Injectable()
export class CaslAbilityFactory {
  createForUser(
    user: Partial<User> & {
      role?: { key?: string; permissions?: PermissionMap | null } | string;
      roleId?: number;
      group?: { permissions?: PermissionMap | null } | null;
    },
  ) {
    const { can, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    const roleKey =
      (typeof user.role === 'object' && user.role?.key) ||
      (typeof user.role === 'string' ? user.role : null);

    if (roleKey === 'ADMIN') {
      can('manage', 'all');
      return build();
    }

    const groupPermissionsRaw =
      typeof user.group === 'object' ? (user.group?.permissions ?? null) : null;
    const normalizedGroupPermissions =
      groupPermissionsRaw === null || groupPermissionsRaw === undefined
        ? null
        : this.normalizePermissions(
            groupPermissionsRaw as PermissionMap | null,
          );

    const rolePermissionsRaw =
      typeof user.role === 'object' ? (user.role?.permissions ?? null) : null;
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
      ? normalizedGroupPermissions
      : useRolePermissions
        ? normalizedRolePermissions
        : DEFAULT_ROLE_PERMISSIONS[(roleKey as RoleKey) ?? 'GUEST'] ||
          DEFAULT_ROLE_PERMISSIONS.GUEST;

    this.applyPermissions(can, permissions);

    return build();
  }

  private normalizePermissions(
    raw: PermissionMap | null,
  ): PermissionMap | null {
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
        VALID_ACTIONS.includes(action),
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
