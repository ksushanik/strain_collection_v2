import { assertOk, request } from './http';
import type { GlobalSearchResponse } from '../types/api';

export async function searchGlobal(params: {
  query: string;
  mode?: 'preview' | 'full';
  perSection?: number;
  signal?: AbortSignal;
}): Promise<GlobalSearchResponse> {
  const qs = new URLSearchParams();
  qs.set('query', params.query);
  if (params.mode) qs.set('mode', params.mode);
  if (params.perSection) qs.set('perSection', String(params.perSection));

  const response = await request(`/api/v1/search?${qs.toString()}`, {
    signal: params.signal,
  });
  await assertOk(response, 'Failed to search');
  return response.json();
}
