import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import http from 'node:http';
import { createApp } from './app';

before(() => {
  process.env.JWT_SECRET = 'a'.repeat(32);
});

function request(server: http.Server, path: string): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const address = server.address();
    if (!address || typeof address === 'string') {
      reject(new Error('Servidor sem endereco'));
      return;
    }
    http.get(`http://127.0.0.1:${address.port}${path}`, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode ?? 0, body: raw ? JSON.parse(raw) : undefined });
      });
    }).on('error', reject);
  });
}

describe('createApp', () => {
  it('responde 200 em /health', async () => {
    const app = createApp({ corsOrigins: [] });
    const server = app.listen(0);
    try {
      const { status, body } = await request(server, '/health');
      assert.equal(status, 200);
      assert.deepEqual(body, { data: { status: 'ok' } });
    } finally {
      server.close();
    }
  });

  it('responde 404 com contrato de erro padronizado para rota inexistente', async () => {
    const app = createApp({ corsOrigins: [] });
    const server = app.listen(0);
    try {
      const { status, body } = await request(server, '/rota-que-nao-existe');
      assert.equal(status, 404);
      assert.deepEqual(body, { error: { code: 'NOT_FOUND', message: 'Rota nao encontrada.' } });
    } finally {
      server.close();
    }
  });
});
