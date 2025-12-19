const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

function authHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
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
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }

  return response;
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function assertOk(response: Response, fallback: string) {
  if (!response.ok) {
    const json = await parseJsonSafe(response);
    const errorLike = (json ?? {}) as { message?: string; error?: string };
    const message =
      errorLike.message ||
      errorLike.error ||
      response.statusText ||
      fallback;
    throw toApiError(json ?? message, fallback, response.status);
  }
  return response;
}
