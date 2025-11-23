import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User, Role } from '@prisma/client';

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

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: Partial<User> & { role: Role }) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    if (user.role === 'ADMIN') {
      // ADMIN: полный доступ
      can('manage', 'all');
    } else if (user.role === 'MANAGER') {
      // MANAGER: читает всё, управляет доменами, кроме Users/Groups/AuditLog
      can('read', 'all');
      can(
        ['create', 'update', 'delete'],
        ['Strain', 'Sample', 'Storage', 'Photo', 'Media'],
      );

      cannot('manage', 'User');
      cannot('manage', 'Group');
      cannot('read', 'AuditLog');
    } else if (user.role === 'USER') {
      // USER: читает домены, базовые create/update
      can('read', [
        'Strain',
        'Sample',
        'Storage',
        'Photo',
        'Media',
        'Analytics',
        'Legend',
        'Settings',
      ]);
      can('create', ['Strain', 'Sample', 'Photo']);
      can('update', ['Strain', 'Sample', 'Photo']); // Проверка владельца на backend

      // Ограничения
      cannot('delete', 'all');
      cannot(['create', 'update'], 'Storage');
      cannot('manage', 'User');
      cannot('manage', 'Group');
      cannot('read', 'AuditLog');
    }

    return build();
  }
}
