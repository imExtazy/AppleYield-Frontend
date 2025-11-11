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
    // Поддержка внешнего API для Tauri через VITE_API_BASE
    const apiBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
    let url: string;
    if (apiBase && /^https?:\/\//.test(apiBase)) {
      const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
      const rel = path.startsWith('/api') ? path.slice(4) : path;
      url = `${base}${rel.startsWith('/') ? '' : '/'}${rel}`;
    } else {
      url = path.startsWith('/api') ? path : `/api${path}`;
    }

    const res = await fetch(url, {
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


