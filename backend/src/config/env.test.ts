import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { getCorsOrigins, getPort, getTrustProxy, requireEnv } from './env';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('requireEnv', () => {
  it('retorna o valor quando a variavel existe', () => {
    process.env.FOO = 'bar';
    assert.equal(requireEnv('FOO'), 'bar');
  });

  it('lanca erro quando a variavel esta ausente', () => {
    delete process.env.FOO;
    assert.throws(() => requireEnv('FOO'));
  });
});

describe('getPort', () => {
  it('usa 5000 como padrao', () => {
    delete process.env.PORT;
    assert.equal(getPort(), 5000);
  });

  it('lanca erro para porta invalida', () => {
    process.env.PORT = 'abc';
    assert.throws(() => getPort());
  });
});

describe('getCorsOrigins', () => {
  it('retorna localhost em desenvolvimento quando nao configurado', () => {
    delete process.env.CORS_ORIGINS;
    process.env.NODE_ENV = 'development';
    assert.deepEqual(getCorsOrigins(), ['http://localhost:5173']);
  });

  it('faz parse de lista separada por virgula', () => {
    process.env.CORS_ORIGINS = 'https://a.com, https://b.com';
    assert.deepEqual(getCorsOrigins(), ['https://a.com', 'https://b.com']);
  });
});

describe('getTrustProxy', () => {
  it('retorna false quando nao configurado', () => {
    delete process.env.TRUST_PROXY;
    assert.equal(getTrustProxy(), false);
  });

  it('retorna numero de hops quando configurado', () => {
    process.env.TRUST_PROXY = '2';
    assert.equal(getTrustProxy(), 2);
  });
});
