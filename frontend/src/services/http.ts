import { clearAuthSession, readAuthSession } from '@/lib/auth-session';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export function getApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

function authHeaders() {
  const { token } = readAuthSession();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type ApiError = {
  message: string;
  status?: number;
  details?: unknown;
};

export function toApiError(
  error: unknown,
  fallback: string,
  status?: number,
): ApiError {
  if (error instanceof Error) {
    return { message: error.message || fallback, status };
  }
  if (typeof error === 'string') {
    return { message: error, status };
  }
  return { message: fallback, status, details: error };
}

export async function request(path: string, options: RequestInit = {}) {
  const headers = {
    ...(options.headers || {}),
    ...authHeaders(),
  } as Record<string, string>;
  const response = await fetch(getApiUrl(path), { ...options, headers });

  if (response.status === 401) {
    const { token } = readAuthSession();
    if (token) {
      clearAuthSession();
    }
  }

  return response;
}

export async function assertOk(response: Response, fallback: string) {
  if (!response.ok) {
    const text = await response.text();
    let json: unknown = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }
    const errorLike = (json ?? {}) as { message?: string; error?: string };
    const message =
      errorLike.message ||
      errorLike.error ||
      text ||
      response.statusText ||
      fallback;
    throw { message, status: response.status, details: json ?? text };
  }
  return response;
}
