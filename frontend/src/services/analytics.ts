import { assertOk, request } from './http';
import { AnalyticsOverview } from '../types/api';

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const response = await request(`/api/v1/analytics/overview`);
  await assertOk(response, 'Failed to fetch analytics');
  return response.json();
}
