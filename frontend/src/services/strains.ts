import { assertOk, request } from './http';
import { PaginatedResponse, Strain, StrainPhoto } from '../types/api';

export async function getStrains(params?: {
  search?: string;
  sampleCode?: string;
  taxonomy?: string;
  genome?: string;
  hasGenome?: boolean;
  antibioticActivity?: string;
  seq?: boolean;
  gramStain?: string;
  phosphates?: boolean;
  siderophores?: boolean;
  pigmentSecretion?: boolean;
  amylase?: string;
  isolationRegion?: string;
  biochemistry?: string;
  iuk?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'identifier' | 'sampleCode' | 'taxonomy16s';
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<Strain>> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.sampleCode) query.set('sampleCode', params.sampleCode);
  if (params?.taxonomy) query.set('taxonomy', params.taxonomy);
  if (params?.genome) query.set('genome', params.genome);
  if (params?.hasGenome !== undefined)
    query.set('hasGenome', String(params.hasGenome));
  if (params?.antibioticActivity)
    query.set('antibioticActivity', params.antibioticActivity);
  if (params?.seq !== undefined) query.set('seq', String(params.seq));
  if (params?.gramStain) query.set('gramStain', params.gramStain);
  if (params?.phosphates !== undefined)
    query.set('phosphates', String(params.phosphates));
  if (params?.siderophores !== undefined)
    query.set('siderophores', String(params.siderophores));
  if (params?.pigmentSecretion !== undefined)
    query.set('pigmentSecretion', String(params.pigmentSecretion));
  if (params?.amylase) query.set('amylase', params.amylase);
  if (params?.isolationRegion)
    query.set('isolationRegion', params.isolationRegion);
  if (params?.biochemistry)
    query.set('biochemistry', params.biochemistry);
  if (params?.iuk) query.set('iuk', params.iuk);
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

export async function createStrain(data: Partial<Strain>): Promise<Strain> {
  const response = await request(`/api/v1/strains`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await assertOk(response, 'Failed to create strain');
  return response.json();
}

export async function updateStrain(id: number, data: Partial<Strain>): Promise<Strain> {
  const response = await request(`/api/v1/strains/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await assertOk(response, 'Failed to update strain');
  return response.json();
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
