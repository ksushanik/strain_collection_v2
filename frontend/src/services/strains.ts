import { assertOk, request } from './http';
import { PaginatedResponse, Strain, StrainPhoto, CreateStrainInput } from '../types/api';

export async function getStrains(params?: {
  search?: string;
  sampleCode?: string;
  taxonomy?: string;
  isolationRegion?: string;
  hasGenome?: boolean;
  gramStain?: 'positive' | 'negative';
  amylase?: boolean;
  phosphateSolubilization?: boolean;
  siderophoreProduction?: boolean;
  pigmentSecretion?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'identifier' | 'sampleCode' | 'taxonomy16s' | 'ncbiScientificName';
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<Strain>> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.sampleCode) query.set('sampleCode', params.sampleCode);
  if (params?.taxonomy) query.set('taxonomy', params.taxonomy);
  if (params?.isolationRegion)
    query.set('isolationRegion', params.isolationRegion);
  if (params?.hasGenome !== undefined)
    query.set('hasGenome', params.hasGenome ? 'true' : 'false');
  if (params?.gramStain) query.set('gramStain', params.gramStain);
  if (params?.amylase !== undefined)
    query.set('amylase', params.amylase ? 'true' : 'false');
  if (params?.phosphateSolubilization !== undefined)
    query.set(
      'phosphateSolubilization',
      params.phosphateSolubilization ? 'true' : 'false',
    );
  if (params?.siderophoreProduction !== undefined)
    query.set(
      'siderophoreProduction',
      params.siderophoreProduction ? 'true' : 'false',
    );
  if (params?.pigmentSecretion !== undefined)
    query.set(
      'pigmentSecretion',
      params.pigmentSecretion ? 'true' : 'false',
    );
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
  const qs = query.toString();
  const response = await request(`/api/v1/strains${qs ? `?${qs}` : ''}`);
  await assertOk(response, 'Failed to fetch strains');
  return response.json();
}

export async function getStrain(id: number): Promise<Strain> {
  const response = await request(`/api/v1/strains/${id}`);
  await assertOk(response, 'Failed to fetch strain');
  return response.json();
}

export async function createStrain(data: CreateStrainInput): Promise<Strain> {
  const response = await request(`/api/v1/strains`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await assertOk(response, 'Failed to create strain');
  return response.json();
}

export async function updateStrain(id: number, data: CreateStrainInput): Promise<Strain> {
  const response = await request(`/api/v1/strains/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await assertOk(response, 'Failed to update strain');
  return response.json();
}

export async function deleteStrain(id: number): Promise<void> {
  const response = await request(`/api/v1/strains/${id}`, {
    method: 'DELETE',
  });
  await assertOk(response, 'Failed to delete strain');
}

export async function linkMediaToStrain(
  strainId: number,
  payload: { mediaId: number; notes?: string },
) {
  const response = await request(`/api/v1/strains/${strainId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await assertOk(response, 'Failed to link media');
  return response.json();
}

export async function unlinkMediaFromStrain(strainId: number, mediaId: number) {
  const response = await request(`/api/v1/strains/${strainId}/media/${mediaId}`, {
    method: 'DELETE',
  });
  await assertOk(response, 'Failed to unlink media');
  return response.json();
}

export async function uploadStrainPhoto(strainId: number, file: File): Promise<StrainPhoto> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request(`/api/v1/strains/${strainId}/photos`, {
    method: 'POST',
    body: formData,
  });

  await assertOk(response, 'Failed to upload strain photo');
  return response.json();
}

export async function deleteStrainPhoto(photoId: number): Promise<void> {
  const response = await request(`/api/v1/strains/photos/${photoId}`, {
    method: 'DELETE',
  });
  await assertOk(response, 'Failed to delete strain photo');
}

export async function updateStrainPhoto(
  photoId: number,
  payload: { name?: string; isPrimary?: boolean },
): Promise<StrainPhoto> {
  const response = await request(`/api/v1/strains/photos/${photoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await assertOk(response, 'Failed to update strain photo');
  return response.json();
}
