import { assertOk, request } from './http';
import type { SamplePhoto, StrainPhoto } from '../types/api';

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
