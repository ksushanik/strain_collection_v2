import { assertOk, request } from './http';
import type { User } from '../types/domain';

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  user: User;
};

export async function loginUser(
  payload: LoginPayload,
): Promise<LoginResponse> {
  const response = await request(`/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await assertOk(response, 'Failed to login');
  return response.json();
}

export async function startAdminSso(): Promise<{ nonce: string }> {
  const response = await request(`/api/v1/admin-sso/sso/start`, {
    method: 'POST',
  });
  await assertOk(response, 'Failed to start SSO');
  return response.json();
}
