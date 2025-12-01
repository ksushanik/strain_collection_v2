import { assertOk, request } from './http';
import { Media, PaginatedResponse } from '../types/api';

export async function getMedia(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Media>> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  const qs = query.toString();
  const response = await request(`/api/v1/media${qs ? `?${qs}` : ''}`);
  await assertOk(response, 'Failed to fetch media');
  return response.json();
}

export async function createMedia(payload: { name: string; composition?: string }): Promise<Media> {
  const response = await request(`/api/v1/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await assertOk(response, 'Failed to create media');
  return response.json();
}

export async function updateMedia(
  id: number,
  payload: { name: string; composition?: string },
): Promise<Media> {
  const response = await request(`/api/v1/media/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await assertOk(response, 'Failed to update media');
  return response.json();
}

export async function deleteMedia(id: number): Promise<void> {
  const response = await request(`/api/v1/media/${id}`, { method: 'DELETE' });
  await assertOk(response, 'Failed to delete media');
}
