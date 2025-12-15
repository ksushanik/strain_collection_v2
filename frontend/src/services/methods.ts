import { assertOk, request } from './http';
import { Method, PaginatedResponse, TraitDefinition, TraitDataType } from '../types/api';

// --- Methods (Legacy/General) ---

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

// --- Traits (New Configuration) ---

export async function getTraits(search?: string): Promise<TraitDefinition[]> {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  const qs = query.toString();
  
  const response = await request(`/api/v1/methods/traits${qs ? `?${qs}` : ''}`);
  await assertOk(response, 'Failed to fetch traits');
  return response.json();
}

export async function getTraitDictionary(): Promise<TraitDefinition[]> {
  const response = await request(`/api/v1/dictionary/traits`);
  await assertOk(response, 'Failed to fetch trait dictionary');
  return response.json();
}

export interface CreateTraitPayload {
  name: string;
  code: string;
  dataType: TraitDataType;
  options?: string[];
  units?: string;
  description?: string;
}

export async function createTrait(payload: CreateTraitPayload): Promise<TraitDefinition> {
  const response = await request(`/api/v1/methods/traits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await assertOk(response, 'Failed to create trait');
  return response.json();
}

export async function updateTrait(id: number, payload: Partial<CreateTraitPayload>): Promise<TraitDefinition> {
  const response = await request(`/api/v1/methods/traits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await assertOk(response, 'Failed to update trait');
  return response.json();
}

export async function deleteTrait(id: number): Promise<void> {
  const response = await request(`/api/v1/methods/traits/${id}`, { method: 'DELETE' });
  await assertOk(response, 'Failed to delete trait');
}

