import React from 'react';
import { Box } from '@adminjs/design-system';
import { BasePropertyProps } from 'adminjs';

const JsonShow = (props: BasePropertyProps) => {
  const { record, property } = props;
  // AdminJS flattens objects in record.params, so 'changes.cols' might be there instead of 'changes' object.
  // But for 'mixed' or 'json' type, it should be available.
  // However, since we changed type to 'textarea' previously, let's revert to 'mixed' or handle it carefully.
  // Actually, let's try to get the raw value.

  let value = record?.params?.[property.path];

  // If value is missing, try to reconstruct from flattened params if it's an object
  if (!value && record?.params) {
    const prefix = `${property.path}.`;
    const obj: Record<string, unknown> = {};
    let hasKeys = false;
    Object.keys(record.params).forEach((key) => {
      if (key.startsWith(prefix)) {
        obj[key.slice(prefix.length)] = record.params[key];
        hasKeys = true;
      }
    });
    if (hasKeys) value = obj;
  }

  if (!value) {
    return React.createElement('span', null, '-');
  }

  let displayValue = value;
  try {
    if (typeof value === 'object') {
      displayValue = JSON.stringify(value, null, 2);
    } else if (typeof value === 'string') {
      if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
        const parsed = JSON.parse(value);
        displayValue = JSON.stringify(parsed, null, 2);
      }
    }
  } catch {
    // ignore
  }

  const content =
    typeof displayValue === 'string'
      ? displayValue
      : JSON.stringify(displayValue, null, 2);

  return React.createElement(
    Box,
    { mb: 'xl' },
    React.createElement(
      'pre',
      {
        style: {
          whiteSpace: 'pre-wrap',
          fontSize: '12px',
          fontFamily: 'monospace',
          backgroundColor: '#f4f6f8',
          padding: '10px',
          borderRadius: '4px',
        },
      },
      content,
    ),
  );
};

export default JsonShow;
