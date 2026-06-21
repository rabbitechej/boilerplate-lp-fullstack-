const configuredBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
export const apiBaseUrl =
  configuredBaseUrl || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1');

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = 'REQUEST_FAILED',
  ) {
    super(message);
  }
}

type ApiErrorBody = { error?: { code?: string; message?: string } };

async function request<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init.headers,
      },
    });
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const error = (body as ApiErrorBody | undefined)?.error;
      throw new ApiError(error?.message ?? `Falha HTTP ${response.status}`, response.status, error?.code);
    }
    if (body === undefined || body === null) {
      throw new ApiError('A API retornou uma resposta vazia.', response.status);
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('A API demorou para responder.', 0, 'TIMEOUT');
    }
    throw new ApiError('Não foi possível acessar a API.', 0, 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}

function unwrapData<T>(body: unknown): T {
  if (!body || typeof body !== 'object' || !('data' in body)) {
    throw new ApiError('A API retornou um contrato inválido.', 0, 'INVALID_RESPONSE');
  }
  return (body as { data: T }).data;
}

export const apiClient = {
  async get<T>(path: string, accessToken?: string): Promise<T> {
    return unwrapData<T>(await request<unknown>(path, { method: 'GET' }, accessToken));
  },
  async post<T>(path: string, payload?: unknown, accessToken?: string): Promise<T> {
    return unwrapData<T>(
      await request<unknown>(path, { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }, accessToken),
    );
  },
  async put<T>(path: string, payload?: unknown, accessToken?: string): Promise<T> {
    return unwrapData<T>(
      await request<unknown>(path, { method: 'PUT', body: payload ? JSON.stringify(payload) : undefined }, accessToken),
    );
  },
  async delete<T>(path: string, accessToken?: string): Promise<T> {
    return unwrapData<T>(await request<unknown>(path, { method: 'DELETE' }, accessToken));
  },
};
