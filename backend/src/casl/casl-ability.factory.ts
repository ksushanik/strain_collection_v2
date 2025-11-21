import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type Subjects =
    | 'Strain'
    | 'Sample'
    | 'Storage'
    | 'User'
    | 'Group'
    | 'AuditLog'
    | 'Photo'
    | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(
            Ability as AbilityClass<AppAbility>,
        );

        if (user.role === 'ADMIN') {
            // ADMIN: полный доступ ко всему
            can('manage', 'all');
        } else if (user.role === 'MANAGER') {
            // MANAGER: читать все, управлять Strain/Sample/Storage, не может управлять Users/Groups/AuditLog
            can('read', 'all');
            can(['create', 'update', 'delete'], ['Strain', 'Sample', 'Storage', 'Photo']);

            cannot('manage', 'User');
            cannot('manage', 'Group');
            cannot('read', 'AuditLog');
        } else if (user.role === 'USER') {
            // USER: читать все, создавать Strain/Sample, редактировать только свои
            can('read', ['Strain', 'Sample', 'Storage', 'Photo']);
            can('create', ['Strain', 'Sample', 'Photo']);
            can('update', ['Strain', 'Sample', 'Photo']); // Проверка владельца на backend

            // Запреты
            cannot('delete', 'all');
            cannot(['create', 'update'], 'Storage');
            cannot('manage', 'User');
            cannot('manage', 'Group');
            cannot('read', 'AuditLog');
        }

        return build();
    }
}
