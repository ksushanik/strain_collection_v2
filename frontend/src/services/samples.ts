import { assertOk, request } from './http';
import {
  PaginatedResponse,
  Sample,
  SamplePhoto,
  SampleTypeOption,
} from '../types/api';

export async function getSamples(params?: {
  search?: string;
  page?: number;
  limit?: number;
  sampleType?: string;
  site?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'collectedAt' | 'code' | 'siteName';
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<Sample>> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.sampleType) query.set('sampleType', params.sampleType);
  if (params?.site) query.set('site', params.site);
  if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params?.dateTo) query.set('dateTo', params.dateTo);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
  const qs = query.toString();
  const response = await request(`/api/v1/samples${qs ? `?${qs}` : ''}`);
  await assertOk(response, 'Failed to fetch samples');
  return response.json();
}

export async function getSample(id: number): Promise<Sample> {
  const response = await request(`/api/v1/samples/${id}`);
  await assertOk(response, 'Failed to fetch sample');
  return response.json();
}

export async function getSampleTypes(): Promise<SampleTypeOption[]> {
  const response = await request('/api/v1/samples/types');
  await assertOk(response, 'Failed to fetch sample types');
  return response.json();
}

export async function createSample(data: Partial<Sample>): Promise<Sample> {
  const response = await request(`/api/v1/samples`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await assertOk(response, 'Failed to create sample');
  return response.json();
}

export async function updateSample(id: number, data: Partial<Sample>): Promise<Sample> {
  const response = await request(`/api/v1/samples/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await assertOk(response, 'Failed to update sample');
  return response.json();
}

export async function deleteSample(id: number): Promise<void> {
  const response = await request(`/api/v1/samples/${id}`, {
    method: 'DELETE',
  });
  await assertOk(response, 'Failed to delete sample');
}

export async function uploadSamplePhoto(sampleId: number, file: File): Promise<SamplePhoto> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request(`/api/v1/samples/${sampleId}/photos`, {
    method: 'POST',
    body: formData,
  });

  await assertOk(response, 'Failed to upload photo');
  return response.json();
}

export async function deleteSamplePhoto(photoId: number): Promise<void> {
  const response = await request(`/api/v1/samples/photos/${photoId}`, {
    method: 'DELETE',
  });
  await assertOk(response, 'Failed to delete photo');
}
