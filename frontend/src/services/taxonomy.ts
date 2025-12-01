import { request } from './http';

export async function searchTaxonomy(
  query: string,
): Promise<Array<{ taxId: string; name: string; rank: string }>> {
  const response = await request(
    `/api/v1/taxonomy/search?q=${encodeURIComponent(query)}`,
  );
  if (!response.ok) return [];
  return response.json();
}
