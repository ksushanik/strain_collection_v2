import { assertOk, request } from './http';
import { Method, PaginatedResponse } from '../types/api';

export async function getMethods(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Method>> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  const qs = query.toString();
  const response = await request(`/api/v1/methods${qs ? `?${qs}` : ''}`);
  await assertOk(response, 'Failed to fetch methods');
  return response.json();
}

export async function createMethod(payload: { name: string; description?: string }): Promise<Method> {
  const response = await request(`/api/v1/methods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await assertOk(response, 'Failed to create method');
  return response.json();
}

export async function updateMethod(
  id: number,
  payload: { name: string; description?: string },
): Promise<Method> {
  const response = await request(`/api/v1/methods/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await assertOk(response, 'Failed to update method');
  return response.json();
}

export async function deleteMethod(id: number): Promise<void> {
  const response = await request(`/api/v1/methods/${id}`, { method: 'DELETE' });
  await assertOk(response, 'Failed to delete method');
}

