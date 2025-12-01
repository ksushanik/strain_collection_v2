import { assertOk, request } from './http';
import { LegendContent, UiBinding } from '../types/api';

export async function getUiBindings(): Promise<UiBinding[]> {
  const response = await request(`/api/v1/settings/ui-bindings`);
  await assertOk(response, 'Failed to fetch UI bindings');
  return response.json();
}

export async function updateUiBindings(
  bindings: UiBinding[],
): Promise<{ updated: number }> {
  const response = await request(`/api/v1/settings/ui-bindings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bindings),
  });
  await assertOk(response, 'Failed to update UI bindings');
  return response.json();
}

export async function getLegend(): Promise<LegendContent | null> {
  const response = await request(`/api/v1/settings/legend`);
  await assertOk(response, 'Failed to fetch legend');
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function updateLegend(content: string): Promise<LegendContent> {
  const response = await request(`/api/v1/settings/legend`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  await assertOk(response, 'Failed to update legend');
  return response.json();
}
