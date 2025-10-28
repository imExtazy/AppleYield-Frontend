export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface HttpRequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 8000;

export async function httpRequest<TResponse = unknown, TBody = unknown>(
  path: string,
  { method = 'GET', body, headers, timeoutMs = DEFAULT_TIMEOUT_MS }: HttpRequestOptions<TBody> = {},
): Promise<TResponse> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(path.startsWith('/api') ? path : `/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // 2xx
    if (res.ok) {
      // 204 No Content
      if (res.status === 204) return undefined as unknown as TResponse;
      return (await res.json()) as TResponse;
    }

    // Пытаемся прочитать json об ошибке
    let detail: any = undefined;
    try { detail = await res.json(); } catch {}
    const message = detail?.detail || `HTTP ${res.status}`;
    const err = new Error(message);
    (err as any).status = res.status;
    throw err;
  } finally {
    clearTimeout(id);
  }
}

export function isNetworkError(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError' || (e as any)?.message?.includes('Failed to fetch');
}


