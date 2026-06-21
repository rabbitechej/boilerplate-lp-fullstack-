import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from './client';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiClient.get', () => {
  it('retorna o campo data quando a resposta e bem-sucedida', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ data: { ok: true } }), { status: 200 })),
    );

    const result = await apiClient.get<{ ok: boolean }>('/qualquer-coisa');
    expect(result).toEqual({ ok: true });
  });

  it('lanca ApiError quando a resposta tem status de erro', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Nao encontrado' } }), {
            status: 404,
          }),
      ),
    );

    await expect(apiClient.get('/inexistente')).rejects.toThrow(ApiError);
  });
});
