import { assertOk, request } from './http';

export async function startAdminSso(): Promise<{ nonce: string }> {
  const response = await request(`/api/v1/admin-sso/sso/start`, {
    method: 'POST',
  });
  await assertOk(response, 'Failed to start SSO');
  return response.json();
}
