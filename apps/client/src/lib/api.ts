import type { UploadedFile } from './types';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(path, { credentials: 'same-origin', ...init, headers });
  const type = res.headers.get('content-type') || '';
  const data: unknown = type.includes('application/json') ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    if (res.status === 401) window.dispatchEvent(new Event('bindery:unauthorized'));
    const body = data as { error?: string; message?: string } | null;
    throw new ApiError(res.status, body?.error || 'server_error', body?.message || res.statusText);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: (files: File[]) => {
    const form = new FormData();
    for (const file of files) form.append('files', file);
    return request<{ files: UploadedFile[] }>('/api/uploads', { method: 'POST', body: form });
  },
};

export function errorKey(error: unknown): { key: string; message: string } {
  if (error instanceof ApiError) {
    return { key: 'error.' + error.code, message: error.message };
  }
  return { key: 'error.server_error', message: error instanceof Error ? error.message : 'Unexpected error.' };
}

export function describeError(t: (key: string) => string, error: unknown): string {
  const { key, message } = errorKey(error);
  const translated = t(key);
  return translated === key ? message : translated;
}
