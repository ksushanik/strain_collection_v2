import React from 'react';
import { Box, Label, CheckBox, Text, Badge } from '@adminjs/design-system';
import { BasePropertyProps } from 'adminjs';

const SUBJECTS = [
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
] as const;

const ACTIONS = ['read', 'create', 'update', 'delete', 'manage'] as const;

type PermissionsMap = Partial<Record<(typeof SUBJECTS)[number], string[]>>;

const ensureArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];

const PermissionsGrid = (props: BasePropertyProps) => {
  const { onChange, property, record } = props;

  const value: PermissionsMap =
    (record?.params?.[property.path] as PermissionsMap | undefined) ?? {};

  const toggle = (subject: (typeof SUBJECTS)[number], action: string) => {
    if (!onChange) return;
    const current = new Set(ensureArray(value[subject]));
    if (current.has(action)) {
      current.delete(action);
    } else {
      current.add(action);
    }
    const next = { ...value, [subject]: Array.from(current) };
    onChange(property.path, next);
  };

  return React.createElement(Box, { variant: 'grey' }, [
    React.createElement(
      Text,
      { key: 'title', mb: 'sm', fontWeight: 'bold' },
      'Права доступа',
    ),
    React.createElement(
      Box,
      {
        key: 'grid',
        display: 'grid',
        gridTemplateColumns: '160px repeat(5, 1fr)',
        gridRowGap: 'md',
        gridColumnGap: 'md',
      },
      [
        React.createElement(Box, { key: 'empty' }),
        ...ACTIONS.map((action) =>
          React.createElement(
            Label,
            { key: action, style: { textAlign: 'center' } },
            action,
          ),
        ),
        ...SUBJECTS.flatMap((subject) => [
          React.createElement(
            Box,
            {
              key: `${subject}-label`,
              display: 'flex',
              alignItems: 'center',
              gap: 'xs',
            },
            React.createElement(Badge, { variant: 'info' }, subject),
          ),
          ...ACTIONS.map((action) => {
            const checked = ensureArray(value[subject]).includes(action);
            return React.createElement(
              Box,
              {
                key: `${subject}-${action}`,
                display: 'flex',
                justifyContent: 'center',
              },
              React.createElement(CheckBox, {
                id: `${subject}-${action}`,
                checked,
                onChange: () => toggle(subject, action),
              }),
            );
          }),
        ]),
      ],
    ),
    React.createElement(
      Text,
      { key: 'hint', mt: 'md', fontSize: 12, color: 'grey60' },
      'Подсказка: используйте «all» + «manage» для полного доступа. При пустой карте будут использованы права роли/группы по умолчанию.',
    ),
  ]);
};

export default PermissionsGrid;
