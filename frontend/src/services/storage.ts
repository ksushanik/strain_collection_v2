import { assertOk, request } from './http';
import { StorageBox, StorageBoxWithCells } from '../types/api';

export async function getStorageBoxes(params?: {
  sortBy?: 'createdAt' | 'displayName';
  sortOrder?: 'asc' | 'desc';
}): Promise<StorageBox[]> {
  const query = new URLSearchParams();
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
  const qs = query.toString();
  const response = await request(`/api/v1/storage/boxes${qs ? `?${qs}` : ''}`);
  await assertOk(response, 'Failed to fetch storage boxes');
  return response.json();
}

export async function createStorageBox(data: {
  displayName: string;
  rows: number;
  cols: number;
  description?: string;
}) {
  const response = await request(`/api/v1/storage/boxes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await assertOk(response, 'Failed to create storage box');
  return response.json();
}

export async function updateStorageBox(
  id: number,
  data: { displayName?: string; description?: string },
) {
  const response = await request(`/api/v1/storage/boxes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await assertOk(response, 'Failed to update storage box');
  return response.json();
}

export async function deleteStorageBox(id: number) {
  const response = await request(`/api/v1/storage/boxes/${id}`, {
    method: 'DELETE',
  });
  await assertOk(response, 'Failed to delete storage box');
  return response.json();
}

export async function getBoxCells(boxId: number): Promise<StorageBoxWithCells> {
  const response = await request(`/api/v1/storage/boxes/${boxId}`);
  await assertOk(response, 'Failed to fetch box cells');
  return response.json();
}

export async function allocateCell(
  boxId: number,
  cellCode: string,
  data: { strainId: number; isPrimary?: boolean },
) {
  const response = await request(
    `/api/v1/storage/boxes/${boxId}/cells/${cellCode}/allocate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strainId: data.strainId,
        isPrimary: data.isPrimary ?? false,
      }),
    },
  );
  await assertOk(response, 'Failed to allocate cell');
  return response.json();
}

export async function unallocateCell(boxId: number, cellCode: string) {
  const response = await request(
    `/api/v1/storage/boxes/${boxId}/cells/${cellCode}/unallocate`,
    {
      method: 'DELETE',
    },
  );
  await assertOk(response, 'Failed to unallocate cell');
  return response.json();
}
