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

  const value: PermissionsMap = React.useMemo(() => {
    const params = record?.params ?? {};
    // If AdminJS passes it as an object (rare but possible)
    if (params[property.path] && typeof params[property.path] === 'object') {
      return params[property.path];
    }

    // Unflatten logic for permissions.{Subject}.{Index}
    const result: PermissionsMap = {};
    Object.keys(params).forEach((key) => {
      if (key.startsWith(`${property.path}.`)) {
        const parts = key.slice(property.path.length + 1).split('.');
        const subject = parts[0] as (typeof SUBJECTS)[number];
        if (SUBJECTS.includes(subject)) {
          if (!result[subject]) {
            result[subject] = [];
          }
          // The value is at this key
          const paramValue = params[key];
          if (typeof paramValue === 'string') {
            result[subject]?.push(paramValue);
          }
        }
      }
    });
    return result;
  }, [record, property.path]);

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
      'Permissions Matrix',
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
      'Tip: checking all + manage grants full access for a subject. Use the checkboxes to toggle allowed actions.',
    ),
  ]);
};

export default PermissionsGrid;
